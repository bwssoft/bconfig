"use server"

import { revalidatePath } from "next/cache"
import { IConfigurationLog, IProfile } from "../definition"
import configurationLogRepository from "../repository/mongodb/configuration-log.repository"

const repository = configurationLogRepository

export async function createOneConfigurationLog(input: Omit<IConfigurationLog
  , "created_at">) {
  await repository.create({
    ...input,
    created_at: new Date()
  })
  revalidatePath("/configuration-log")
  return input
}

export async function createManyConfigurationLog(input: Omit<IConfigurationLog
  , "created_at">[]) {
  await repository.createMany(input.map(i => ({
    ...i,
    created_at: new Date()
  })))
  revalidatePath("/configuration-log")
  return input
}

export async function findOneConfigurationLog(input: Partial<IConfigurationLog>) {
  return await repository.findOne(input)
}

export async function updateOneConfigurationLogById(query: { id: string }, value: Omit<IConfigurationLog, "id" | "created_at">) {
  const result = await repository.updateOne(query, value)
  revalidatePath("/configuration-log")
  return result
}

export async function deleteOneConfigurationLogById(query: { id: string }) {
  const result = await repository.deleteOne(query)
  revalidatePath("/configuration-log")
  return result
}

export async function findAllConfigurationLog(props: { is_configured?: boolean, query?: string }): Promise<(IConfigurationLog & { profile: IProfile })[]> {
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
      $match: {
        $and: [
          ...(typeof props.is_configured !== "undefined" ? [{ is_configured: props.is_configured }] : []),
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
              }
            ]
          }
        ]
      }
    },
    {
      $addFields: {
        profile: { $first: "$profile" }
      }
    },
    { $project: { _id: 0 } }
  ])
  return await aggregate.toArray() as (IConfigurationLog & { profile: IProfile })[]
}



