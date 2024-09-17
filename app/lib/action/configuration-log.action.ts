"use server"

import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import * as XLSX from 'xlsx'
import { IConfigurationLog, IProfile, IUser } from "../definition"
import configurationLogRepository from "../repository/mongodb/configuration-log.repository"
import { xlsxFitToColumn } from "../util/xlsx-fit-to-column"

const repository = configurationLogRepository

export async function createOneConfigurationLog(input: Omit<IConfigurationLog
  , "created_at" | "user_id">) {
  const session = await auth()
  await repository.create({
    ...input,
    user_id: session?.user?.id!,
    created_at: new Date()
  })
  revalidatePath("/configuration-log")
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

export async function findOneConfigurationLog(input: Partial<IConfigurationLog>) {
  return await repository.findOne(input)
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
        _id: 0,
        "profile._id": 0,
        "user._id": 0,
        "user.password": 0,
      }
    }
  ])
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
        doc.user.name,
        doc.profile.name,
        new Date(doc.metadata.init_time_configuration).toLocaleString("pt-BR"),
        doc.imei,
        doc.iccid,
        doc.et,
        doc.actual_native_profile?.check,
        doc.actual_native_profile?.cxip,
        doc.actual_native_profile?.dns
      ];
      worksheet['!cols'] = xlsxFitToColumn([row]);
      XLSX.utils.sheet_add_aoa(worksheet, [row], { origin: -1 });
    }
  }

  return workbook;
}



