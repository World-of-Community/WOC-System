import mongoose from 'mongoose';

const inviteCacheSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  invites: {
    type: Object,  // oder genauer, falls du Struktur kennst, z.B. Map, Array
    default: {},
  },
});

export default mongoose.model('InviteCache', inviteCacheSchema);
