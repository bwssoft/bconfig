import { IProfile } from "@/app/lib/definition";
import { BaseRepository } from "./@base/base";

class ProfileRepository extends BaseRepository<IProfile> {
  private static instance: ProfileRepository;

  private constructor() {
    super({
      collection: "profile",
      db: "bconfig"
    });
  }

  public static getInstance(): ProfileRepository {
    if (!ProfileRepository.instance) {
      ProfileRepository.instance = new ProfileRepository();
    }
    return ProfileRepository.instance;
  }

  async findAllWithClient() {
    const db = await this.connect();
    return await db.collection<IProfile>(this.collection).aggregate([
      { $match: {} },
      {
        $lookup: {
          as: "client",
          from: "client",
          localField: "client_id",
          foreignField: "id"
        }
      },
      {

        $project: {
          id: 1,
          name: 1,
          type: 1,
          sales_stage: 1,
          created_at: 1,
          client: { $first: "$client" },
        }
      },
    ]).toArray();
  }
}

export default ProfileRepository.getInstance();
