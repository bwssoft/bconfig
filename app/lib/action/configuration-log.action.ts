"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import * as XLSX from 'xlsx'
import { IConfigurationLog, IProfile, IUser } from "../definition"
import configurationLogRepository from "../repository/mongodb/configuration-log.repository"
import { FindOptions } from "mongodb"

const repository = configurationLogRepository

export async function createOneConfigurationLog(input: Omit<IConfigurationLog
  , "created_at" | "user_id">) {
  const session = await auth()
  await repository.create({
    ...input,
    user_id: session?.user?.id!,
    created_at: new Date()
  })
  return input
}

export async function createManyConfigurationLog(input: Omit<IConfigurationLog
  , "created_at" | "user_id">[]) {
  const session = await auth()
  await repository.createMany(input.map(i => ({
    ...i,
    user_id: session?.user?.id!,
    created_at: new Date()
  })))
  revalidatePath("/configuration-log")
  return input
}

export async function findOneConfigurationLog(input: Partial<IConfigurationLog>, options?: FindOptions) {
  return await repository.findOne(input, options)
}


export async function updateOneConfigurationLog(query: Partial<IConfigurationLog>, value: Partial<IConfigurationLog>) {
  return await repository.updateOne(query, value)
}

export async function findAllConfigurationLog(props: {
  is_configured?: boolean,
  query?: string,
  from?: Date,
  to?: Date,
  page?: number
}): Promise<{
  total: number
  data: (IConfigurationLog & { profile: IProfile, user: IUser })[]
}> {
  const matchStage = {
    $and: [
      ...(typeof props.is_configured !== "undefined" ? [{ is_configured: props.is_configured }] : []),
      ...(typeof props.from !== "undefined" && typeof props.to !== "undefined" ? [{ created_at: { $lte: new Date(props.to), $gte: new Date(props.from) } }] : []),
      {
        $or: [
          {
            imei: { $regex: props?.query, $options: "i" }
          },
          {
            iccid: {
              $regex: props?.query,
              $options: "i"
            }
          },
          {
            "profile.name": {
              $regex: props?.query,
              $options: "i"
            }
          },
          {
            "user.name": {
              $regex: props?.query,
              $options: "i"
            }
          }
        ]
      }
    ]
  };
  const skipStage = (props?.page ? props.page - 1 : 0) * 20
  const aggregate = await repository.aggregate([
    {
      $lookup: {
        from: "profile",
        localField: "profile_id",
        foreignField: "id",
        as: "profile"
      }
    },
    {
      $lookup: {
        from: "user",
        localField: "user_id",
        foreignField: "id",
        as: "user"
      }
    },
    {
      $match: matchStage
    },
    {
      $facet: {
        data: [
          { $skip: skipStage },
          { $limit: 20 }, // Limita o número de documentos retornados
          {
            $addFields: {
              profile: { $first: "$profile" },
              user: { $first: "$user" }
            }
          },
          {
            $project: {
              _id: 0,
              "profile._id": 0,
              "user._id": 0,
              "user.password": 0,
            }
          }
        ],
        totalCount: [
          { $count: "count" } // Conta o número total de documentos correspondentes
        ]
      }
    }
  ])
  const result = await aggregate.toArray()
  const data = result[0]?.data || [];
  const total = result[0]?.totalCount[0]?.count || 0;
  return { total, data };
}

export async function exportConfigurationLog(props: {
  is_configured?: boolean,
  query?: string,
  from?: Date,
  to?: Date
}): Promise<XLSX.WorkBook> {
  const cursor = await repository.aggregate<IConfigurationLog & { user: IUser, profile: IProfile }>([
    {
      $lookup: {
        from: "profile",
        localField: "profile_id",
        foreignField: "id",
        as: "profile",
        pipeline: [{$project: {name: 1}}]
      }
    },
    {
      $lookup: {
        from: "user",
        localField: "user_id",
        foreignField: "id",
        as: "user",
        pipeline: [{$project: {name: 1}}]
      }
    },
    {
      $match: {
        ...(props.from || props.is_configured || props.query || props.query ? {
          $and: [
            ...(typeof props.is_configured !== "undefined" ? [{ is_configured: props.is_configured }] : []),
            ...(typeof props.from !== "undefined" && typeof props.to !== "undefined" ? [{ created_at: { $lte: new Date(props.to), $gte: new Date(props.from) } }] : []),
            ...(props?.query ? [{
              $or: [
                ...(props?.query ? [
                  {
                    imei: { $regex: props?.query, $options: "i" }
                  }
                ] : []),
                {
                  iccid: {
                    $regex: props?.query,
                    $options: "i"
                  }
                },
                {
                  "profile.name": {
                    $regex: props?.query,
                    $options: "i"
                  }
                },
                {
                  "user.name": {
                    $regex: props?.query,
                    $options: "i"
                  }
                }
              ]
            }] : [])
          ]
        } : {})
      }
    },
    {
      $addFields: {
        profile: { $first: "$profile" },
        user: { $first: "$user" }
      }
    },
    {
      $match: {
        profile: { $exists: true },
        user: { $exists: true }
      }
    },
    {
      $project: {
        is_configured: 1,
        user: 1,
        profile: 1,
        imei: 1,
        iccid: 1,
        et: 1,
        actual_native_profile: 1,
        metadata: 1,
        created_at: 1
      }
    },
    {
      $sort: {
        imei: 1,
        created_at: -1,
      },
    },
    {
      $group: {
        _id: "$imei",
        latestDocument: { $first: "$$ROOT" },
      },
    },
    {
      $replaceRoot: { newRoot: "$latestDocument" },
    },
    {
      $sort: {
        created_at: 1,
      },
    },
  ], { allowDiskUse: true })
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([[
    "Configurado", "Usuário", "Perfil", "Data", "IMEI", "ICCID", "ET", "Check", "CXIP", "DNS"
  ]]);
  XLSX.utils.book_append_sheet(workbook, worksheet, `LOGS_CONFIGURACAO`);
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (doc) {
      const row = [
        doc.is_configured ? "Sucesso" : "Falha",
        doc.user?.name ?? "--",
        doc.profile?.name ?? "--",
        new Date(doc.metadata.init_time_configuration).toLocaleString("pt-BR", {
          timeZone: 'America/Sao_Paulo'
        }),
        doc.imei,
        doc.iccid,
        doc.et,
        doc.actual_native_profile?.check,
        doc.actual_native_profile?.cxip,
        doc.actual_native_profile?.dns
      ];
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
    }
  }

  return workbook;
}


export async function countGatewayConfigured(props: { model: IProfile["model"] }) {
  const { model } = props
  const aggregate = await repository.aggregate([
    {
      $match: {
        is_configured: true,
        $or: [
          { "desired_profile.ip.primary": { $ne: null } },
          { "desired_profile.ip.secondary": { $ne: null } },
          { "desired_profile.dns": { $ne: null } }
        ]
      }
    },
    {
      $lookup: {
        from: "profile",
        localField: "profile_id",
        foreignField: "id",
        as: "profile",
        pipeline: [
          {
            $project: {
              _id: 0,
              model: 1
            }
          }
        ]
      }
    },
    { $match: { "profile.model": model } },
    {
      $addFields: {
        primaryIP: {
          $cond: {
            if: { $ne: ["$desired_profile.ip.primary", null] },
            then: {
              $concat: [
                "$desired_profile.ip.primary.ip",
                ":",
                { $toString: "$desired_profile.ip.primary.port" }
              ]
            },
            else: null
          }
        },
        secondaryIP: {
          $cond: {
            if: { $ne: ["$desired_profile.ip.secondary", null] },
            then: {
              $concat: [
                "$desired_profile.ip.secondary.ip",
                ":",
                { $toString: "$desired_profile.ip.secondary.port" }
              ]
            },
            else: null
          }
        },
        dns: {
          $cond: {
            if: { $ne: ["$desired_profile.dns", null] },
            then: {
              $concat: [
                "$desired_profile.dns.address",
                ":",
                { $toString: "$desired_profile.dns.port" }
              ]
            },
            else: null
          }
        }
      }
    },
    {
      $project: {
        ipsAndDns: {
          $filter: {
            input: ["$primaryIP", "$secondaryIP", "$dns"],
            as: "item",
            cond: { $ne: ["$$item", null] }
          }
        }
      }
    },
    { $unwind: "$ipsAndDns" },
    {
      $group: {
        _id: "$ipsAndDns",
        count: { $sum: 1 }
      }
    },
    {
      $facet: {
        aboveThreshold: [
          { $match: { count: { $gte: 50 } } },
          { $sort: { count: -1 } }
        ],
        belowThreshold: [
          { $match: { count: { $lt: 50 } } },
          {
            $group: {
              _id: "Outros",
              count: { $sum: "$count" }
            }
          }
        ]
      }
    },
    {
      $project: {
        results: {
          $concatArrays: ["$aboveThreshold", "$belowThreshold"]
        }
      }
    },
    { $unwind: "$results" },
    {
      $replaceRoot: { newRoot: "$results" }
    }
  ]
  )
  return await aggregate.toArray()
}





