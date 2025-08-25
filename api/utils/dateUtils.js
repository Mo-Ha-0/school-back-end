function toDateOnly(value) {
    if (value == null) return value;

    let date;
    if (value instanceof Date) {
        date = value;
    } else if (typeof value === 'string') {
        const trimmed = value.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
            date = parsed;
        } else {
            return trimmed;
        }
    } else if (typeof value === 'number') {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            date = parsed;
        } else {
            return value;
        }
    } else {
        return value;
    }

    return date.toISOString().slice(0, 10);
}

function toDateOnlyIfDateLike(value) {
    if (value instanceof Date) return toDateOnly(value);
    if (typeof value === 'string') return toDateOnly(value);
    if (typeof value === 'number') return toDateOnly(value);
    return value;
}

module.exports = { toDateOnly, toDateOnlyIfDateLike };
