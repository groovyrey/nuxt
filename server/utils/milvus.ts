import { MilvusClient, DataType, MetricType, IndexType } from '@zilliz/milvus2-sdk-node';

let milvusClient: MilvusClient | null = null;

const COLLECTION_NAME = 'face_templates';
const DIMENSION = 128; // face-api.js descriptors are 128-d

export const useMilvus = () => {
  if (!milvusClient && process.env.MILVUS_ADDRESS) {
    // Clean up address: remove protocol and ensure it's just host:port
    const address = process.env.MILVUS_ADDRESS.replace(/^https?:\/\//, '');
    
    milvusClient = new MilvusClient({
      address: address,
      token: process.env.MILVUS_TOKEN,
      ssl: true, // Required for Zilliz Cloud
      channelOptions: {
        // Reduce connection wait time and retries for serverless
        'grpc.initial_reconnect_backoff_ms': 1000,
        'grpc.max_reconnect_backoff_ms': 5000,
        'grpc.keepalive_time_ms': 60000,
        'grpc.keepalive_timeout_ms': 20000,
      }
    });
  }
  return milvusClient;
};

export const initMilvus = async () => {
  const client = useMilvus();
  if (!client) return;

  try {
    const hasCollection = await client.hasCollection({ 
      collection_name: COLLECTION_NAME,
      timeout: 5000 
    });
    
    if (!hasCollection.value) {
      console.log(`Creating Milvus collection: ${COLLECTION_NAME}`);
      await client.createCollection({
        collection_name: COLLECTION_NAME,
        fields: [
          { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
          { name: 'developer_id', data_type: DataType.VarChar, max_length: 255 },
          { name: 'email', data_type: DataType.VarChar, max_length: 255 },
          { name: 'vector', data_type: DataType.FloatVector, dim: DIMENSION }
        ],
        timeout: 5000
      });

      // Create index for fast search
      await client.createIndex({
        collection_name: COLLECTION_NAME,
        field_name: 'vector',
        index_name: 'face_index',
        index_type: IndexType.HNSW,
        metric_type: MetricType.L2,
        params: { M: 16, efConstruction: 64 },
        timeout: 5000
      });

      await client.loadCollectionSync({ 
        collection_name: COLLECTION_NAME,
        timeout: 10000 
      });
    }
  } catch (err) {
    console.error('Milvus init failed:', err);
  }
};

export const upsertFaceVector = async (developerId: string, email: string, vector: number[]) => {
  const client = useMilvus();
  if (!client) return;

  try {
    await client.delete({
      collection_name: COLLECTION_NAME,
      filter: `developer_id == "${developerId}" and email == "${email}"`,
      timeout: 5000
    });

    await client.insert({
      collection_name: COLLECTION_NAME,
      fields_data: [
        {
          developer_id: developerId,
          email: email,
          vector: vector
        }
      ],
      timeout: 5000
    });
  } catch (err) {
    console.error('Milvus upsert failed:', err);
  }
};

export const searchFaceVector = async (developerId: string, vector: number[], threshold: number, email?: string) => {
  const client = useMilvus();
  if (!client) return null;

  try {
    const filter = email 
      ? `developer_id == "${developerId}" and email == "${email}"`
      : `developer_id == "${developerId}"`;

    const results = await client.search({
      collection_name: COLLECTION_NAME,
      vector: vector,
      filter: filter,
      limit: 1,
      params: { nprobe: 10 },
      output_fields: ['email'],
      timeout: 5000
    });

    if (results.results.length > 0) {
      const topMatch = results.results[0];
      // Note: face-api.js euclidean distance vs Milvus L2
      // Milvus L2 returns squared Euclidean distance.
      // To match our EUCLIDEAN_THRESHOLD (0.45), we compare against threshold^2.
      const squaredThreshold = threshold * threshold;
      
      if (topMatch.score < squaredThreshold) {
        return {
          email: topMatch.email as string,
          distance: Math.sqrt(Number(topMatch.score)) // Return Euclidean for logging
        };
      }
    }
  } catch (err) {
    console.error('Milvus search failed:', err);
  }
  return null;
};
