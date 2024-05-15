module.exports = {
    getFieldsIfExist (field, defaultValue) {
        return field !== undefined ? field : defaultValue
    }
}
