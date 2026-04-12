const timeZoneOffset = new Date().getTimezoneOffset()

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

function toLocalDate(date: string) {
    const activityDateFromDatabaseAsDate = Date.parse(date)
    const activityDateLocal = new Date(activityDateFromDatabaseAsDate - timeZoneOffset * 60 * 1000)
    return activityDateLocal.toISOString().split("T")[0]
}

function toLocalDateTime(dateTime: string) {
    const dateTimeFromDatabaseAsDate = Date.parse(dateTime)
    const dateTimeLocal = new Date(dateTimeFromDatabaseAsDate - timeZoneOffset * 60 * 1000)
    return dateTimeLocal.toISOString().split(".")[0]
}

function getCurrentDate() {
    const currentDateTimeLocal = new Date(new Date().getTime() - timeZoneOffset * 60 * 1000)
    const currentDate = currentDateTimeLocal.toISOString().split("T")[0]
    return currentDate;
}

function getCurrentDateTime() {
    const currentDateTimeLocal = new Date(new Date().getTime() - timeZoneOffset * 60 * 1000)
    return currentDateTimeLocal.toISOString().split(".")[0]
}

export { dateTimeToString, dateToString, toLocalDate, toLocalDateTime, getCurrentDate, getCurrentDateTime };
