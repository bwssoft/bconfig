"use server"

import { revalidatePath } from "next/cache"
import { IAutoTestLog, IUser } from "../definition"
import autoTestLogRepository from "../repository/mongodb/auto-test-log.repository"
import { auth } from "@/auth"

const repository = autoTestLogRepository

export async function createOneAutoTestLog(input: Omit<IAutoTestLog
  , "created_at" | "user_id">) {
  const session = await auth()
  await repository.create({
    ...input,
    user_id: session?.user?.id!,
    created_at: new Date()
  })
  revalidatePath("/auto-test-log")
  return input
}

export async function createManyAutoTestLog(input: Omit<IAutoTestLog
  , "created_at" | "user_id">[]) {
  const session = await auth()
  await repository.createMany(input.map(i => ({
    ...i,
    user_id: session?.user?.id!,
    created_at: new Date()
  })))
  revalidatePath("/auto-test-log")
  return input
}

export async function findOneAutoTestLog(input: Partial<IAutoTestLog>) {
  return await repository.findOne(input)
}

export async function findAllAutoTestLog(props: { is_successful?: boolean, query?: string }): Promise<(IAutoTestLog & { user: IUser })[]> {
  const aggregate = await repository.aggregate([
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
          ...(typeof props.is_successful !== "undefined" ? [{ is_successful: props.is_successful }] : []),
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
                "user.name": {
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
        user: { $first: "$user" }
      }
    },
    {
      $project: {
        _id: 0,
        "user._id": 0,
        "user.password": 0,
      }
    }
  ])
  return await aggregate.toArray() as (IAutoTestLog & { user: IUser })[]
}



