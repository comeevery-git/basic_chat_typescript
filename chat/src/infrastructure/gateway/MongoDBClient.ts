import {MongoClient, ServerApiVersion} from 'mongodb';
import config from '../../common/Config';

let client: MongoClient | null = null;

export const connectToDatabase = async () => {
    const uri = config.MONGODB_URI;

    if (!client) {
        // @ts-ignore
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            ssl: true,
            tls: true,
            tlsAllowInvalidCertificates: true,
            replicaSet: 'atlas-11uxlx-shard-0',  // 에러 메시지에서 보이는 setName
            authSource: 'admin'
        });
    }

    await client.connect();
    return client.db('chat_database');
};
