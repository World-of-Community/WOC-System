import threaddb from "#models/Thread.js";

const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export default {
  name: "threadCleanup",
  cron: "0 0 * * *",

  async execute(client) {
    const threads = await threaddb.find();

    for (const thread of threads) {
      if (Date.now() - new Date(thread.createdAt).getTime() < MAX_AGE) {continue;}

      const threadChannel = client.channels.cache.get(thread.threadID);
      if (threadChannel) {
        await threadChannel.delete();
      }
      await threaddb.findOneAndDelete({ threadID: thread.threadID });
    }
  },
};
