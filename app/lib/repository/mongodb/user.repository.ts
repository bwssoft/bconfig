import { IUser } from "@/app/lib/definition";
import { BaseRepository } from "./@base/base";

class UserRepository extends BaseRepository<IUser> {
  private static instance: UserRepository;

  private constructor() {
    super({
      collection: "user",
      db: "bconfig"
    });
  }

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }
}

export default UserRepository.getInstance();
