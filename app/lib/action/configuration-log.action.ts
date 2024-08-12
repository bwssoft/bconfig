"use server"

import { revalidatePath } from "next/cache"
import { IConfigurationLog, IProfile, IUser } from "../definition"
import configurationLogRepository from "../repository/mongodb/configuration-log.repository"
import { auth } from "@/auth"

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

export async function findAllConfigurationLog(props: { is_configured?: boolean, query?: string }): Promise<(IConfigurationLog & { profile: IProfile, user: IUser })[]> {
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
        profile: { $first: "$profile" },
        user: { $first: "$user" }
      }
    },
    { $project: { _id: 0 } }
  ])
  return await aggregate.toArray() as (IConfigurationLog & { profile: IProfile, user: IUser })[]
}



