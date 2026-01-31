function dateTimeToString(dateTime: string) {
    return Intl
        .DateTimeFormat(undefined, {dateStyle: "full", timeStyle: "short"})
        .format(Date.parse(dateTime))
}

function dateToString(date: string) {
    return Intl
        .DateTimeFormat(undefined, {dateStyle: "full"})
        .format(Date.parse(date + "T00:00:00"))
}

export { dateTimeToString, dateToString };