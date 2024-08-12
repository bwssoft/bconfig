import { IAutoTestLog } from "@/app/lib/definition";
import { BaseRepository } from "./@base/base";

class AutoTestLogRepository extends BaseRepository<IAutoTestLog> {
  private static instance: AutoTestLogRepository;

  private constructor() {
    super({
      collection: "auto-test-log",
      db: "bconfig"
    });
  }

  public static getInstance(): AutoTestLogRepository {
    if (!AutoTestLogRepository.instance) {
      AutoTestLogRepository.instance = new AutoTestLogRepository();
    }
    return AutoTestLogRepository.instance;
  }
}

export default AutoTestLogRepository.getInstance();
