import { initMilvus } from '../utils/milvus';

export default defineNitroPlugin(async () => {
  if (process.env.MILVUS_ADDRESS) {
    console.log('Initializing Milvus connection...');
    await initMilvus();
  }
});
