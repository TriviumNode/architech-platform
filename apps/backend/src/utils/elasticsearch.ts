import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({ node: 'http://172.28.31.28:9200' });
