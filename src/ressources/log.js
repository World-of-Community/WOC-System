const ThreadIDs = {
    CHANNEL: "1269294362869633135",
    MESSAGE: "1269294582366212168",
    JOIN: "1269294005254881412",
    ROLES: "1269294740172705853",
    SERVER: "1269295029122367549",
    MODERATION: "1269295450721222740",
    INVITE: "1269295619483373588"
};
//sendLog("CHANNEL", embed)
async function sendLog(threadName, embed) {
    const serverCatch = client.guilds.cache.get("815919809379172354");
    const logchannel = await serverCatch.channels.cache.get("1263436406655680513");

    const threadID = ThreadIDs[threadName.toUpperCase()];
    if (!threadID) {
        throw new Error(`Thread name "${threadName}" is not defined.`);
    }

    await logchannel.threads.cache.get(threadID).send({embeds: [embed]});
}
module.exports = {
    ThreadIDs,
    sendLog
};