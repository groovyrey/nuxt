import { MilvusClient, DataType, MetricType, IndexType } from '@zilliz/milvus2-sdk-node';

let milvusClient: MilvusClient | null = null;

const COLLECTION_NAME = 'face_templates';
const DIMENSION = 128; // face-api.js descriptors are 128-d

export const useMilvus = () => {
  if (!milvusClient && process.env.MILVUS_ADDRESS) {
    milvusClient = new MilvusClient({
      address: process.env.MILVUS_ADDRESS,
      token: process.env.MILVUS_TOKEN
    });
  }
  return milvusClient;
};

export const initMilvus = async () => {
  const client = useMilvus();
  if (!client) return;

  try {
    const hasCollection = await client.hasCollection({ collection_name: COLLECTION_NAME });
    
    if (!hasCollection.value) {
      console.log(`Creating Milvus collection: ${COLLECTION_NAME}`);
      await client.createCollection({
        collection_name: COLLECTION_NAME,
        fields: [
          { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
          { name: 'developer_id', data_type: DataType.VarChar, max_length: 255 },
          { name: 'email', data_type: DataType.VarChar, max_length: 255 },
          { name: 'vector', data_type: DataType.FloatVector, dim: DIMENSION }
        ]
      });

      // Create index for fast search
      await client.createIndex({
        collection_name: COLLECTION_NAME,
        field_name: 'vector',
        index_name: 'face_index',
        index_type: IndexType.HNSW,
        metric_type: MetricType.L2,
        params: { M: 16, efConstruction: 64 }
      });

      await client.loadCollectionSync({ collection_name: COLLECTION_NAME });
    }
  } catch (err) {
    console.error('Milvus init failed:', err);
  }
};

export const upsertFaceVector = async (developerId: string, email: string, vector: number[]) => {
  const client = useMilvus();
  if (!client) return;

  try {
    // Delete existing if any (Milvus doesn't have unique VarChar constraint on non-PK fields)
    // In a real app, you might store the Milvus internal ID in MySQL for direct deletion
    await client.delete({
      collection_name: COLLECTION_NAME,
      filter: `developer_id == "${developerId}" and email == "${email}"`
    });

    await client.insert({
      collection_name: COLLECTION_NAME,
      fields_data: [
        {
          developer_id: developerId,
          email: email,
          vector: vector
        }
      ]
    });
  } catch (err) {
    console.error('Milvus upsert failed:', err);
  }
};

export const searchFaceVector = async (developerId: string, vector: number[], threshold: number) => {
  const client = useMilvus();
  if (!client) return null;

  try {
    const results = await client.search({
      collection_name: COLLECTION_NAME,
      vector: vector,
      filter: `developer_id == "${developerId}"`,
      limit: 1,
      params: { nprobe: 10 },
      output_fields: ['email']
    });

    if (results.results.length > 0) {
      const topMatch = results.results[0];
      // Note: face-api.js euclidean distance vs Milvus L2
      // We check if distance is within the threshold
      if (topMatch.score < threshold) {
        return {
          email: topMatch.email as string,
          distance: topMatch.score
        };
      }
    }
  } catch (err) {
    console.error('Milvus search failed:', err);
  }
  return null;
};
