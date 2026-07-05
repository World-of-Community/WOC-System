const func = {
  tausender: function formatiereTausender(zahl) {
    return zahl.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  },
};
export default func;
