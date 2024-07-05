import clientPromise from "./config";
import { AggregateOptions, AggregationCursor, Document, Filter, WithId } from "mongodb";

type Constructor = {
  collection: string
  db: string
}

export class BaseRepository<Entity extends Document> {
  protected collection: string
  protected db: string

  constructor(args: Constructor) {
    this.collection = args.collection
    this.db = args.db
  }

  async create(data: Entity) {
    const db = await this.connect();
    return await db.collection(this.collection).insertOne(data);
  }

  async createMany(data: Entity[]) {
    const db = await this.connect();
    return await db.collection(this.collection).insertMany(data);
  }

  async findOne(params: Partial<Entity>) {
    const db = await this.connect();
    return await db.collection<Entity>(this.collection).findOne(params as Partial<WithId<Entity>>, { projection: { _id: 0 } })
  }

  async findAll() {
    const db = await this.connect();
    return await db.collection<Entity>(this.collection).find().project({ _id: 0 }).toArray();
  }

  async updateOne(query: Filter<Entity>, value: Partial<Entity>) {
    const db = await this.connect();
    return await db.collection<Entity>(this.collection).updateOne(query, { $set: value })
  }

  async deleteOne(query: Filter<Entity>) {
    const db = await this.connect();
    return await db.collection<Entity>(this.collection).deleteOne(query);
  }

  async aggregate<T extends Document>(pipeline?: Document[], options?: AggregateOptions): Promise<AggregationCursor<T>> {
    const db = await this.connect();
    return db.collection(this.collection).aggregate<T>(pipeline, options)
  }

  async getDb() {
    const db = await this.connect();
    return db
  }

  async connect() {
    const client = await clientPromise;
    const db = client.db(this.db);
    return db;
  }
}


