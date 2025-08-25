function stripSensitive(value) {
    if (Array.isArray(value)) {
        return value.map(stripSensitive);
    }
    if (value && typeof value === 'object') {
        if (value instanceof Date) return value;
        const tag = Object.prototype.toString.call(value);
        if (tag !== '[object Object]') return value;

        const cleaned = {};
        for (const key of Object.keys(value)) {
            if (
                key === 'created_at' ||
                key === 'updated_at' ||
                key === 'password_hash' ||
                key === 'student_created_at'
            ) {
                continue;
            }
            cleaned[key] = stripSensitive(value[key]);
        }
        return cleaned;
    }
    return value;
}

module.exports = { stripSensitive };
