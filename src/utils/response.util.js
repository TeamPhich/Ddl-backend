module.exports.success = ({data}) => {
    if(!data) { throw new Error("missing data") }
    return {
        success: true,
        data
    }
};

module.exports.fail = ({reason}) => ({
    success: false,
    reason
});