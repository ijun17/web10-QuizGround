// import RedisMock from 'ioredis-mock';
//
// export class CustomRedisMock extends RedisMock {
//   constructor() {
//     super();
//   }
//
//   // @ts-ignore
//   async hset(key: string, value: string): Promise<void> {
//     await super.hset(key, value);
//     console.log(key);
//     await super.publish(`__keyspace@0__:${key}`, 'hset');
//   }
// }
