// import { createClient } from '@sanity/client';
// import imageUrlBuilder from '@sanity/image-url';

// // Public client (read-only)
// export const config = {
//   projectId: 'z61ly1gu',
//   dataset: 'production',
//   useCdn: true,
//   apiVersion: '2025-09-07',
// };

// export const client = createClient(config);

// // Admin client (read/write)
// export const adminConfig = {
//   ...config,
//   useCdn: false, // always fresh data
//   token: process.env.SANITY_API_TOKEN, 
// };

// export const adminClient = createClient(adminConfig);

// // Image URL Builder
// const builder = imageUrlBuilder(config);
// export const urlFor = (source: string) => builder.image(source);




import { createClient } from '@sanity/client';
import { SANITY_PROJECT_ID, SANITY_DATASET, SANITY_TOKEN } from '@env'

// Public client (read-only)
export const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-09-07',
  token: SANITY_TOKEN, // only if needed for write
  useCdn: true, // faster reads
});