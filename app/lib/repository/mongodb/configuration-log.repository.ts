import { IConfigurationLog } from "@/app/lib/definition";
import { BaseRepository } from "./@base/base";

class ConfigurationLogRepository extends BaseRepository<IConfigurationLog> {
  private static instance: ConfigurationLogRepository;

  private constructor() {
    super({
      collection: "configuration-log",
      db: "bconfig"
    });
  }

  public static getInstance(): ConfigurationLogRepository {
    if (!ConfigurationLogRepository.instance) {
      ConfigurationLogRepository.instance = new ConfigurationLogRepository();
    }
    return ConfigurationLogRepository.instance;
  }
}

export default ConfigurationLogRepository.getInstance();
