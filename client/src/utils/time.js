export default function (seconds) {
    const origin = new Date(Number(seconds))
    const current = new Date()

    let year = origin.getFullYear()
    let month = origin.getMonth() + 1
    let date = origin.getDate()
    let hours = origin.getHours()
    let minutes = origin.getMinutes()

    year = current.getFullYear() - year < 1 ? '' : `${year}-`
    month += '-'
    hours += ' : '

    if (current.getDate() - date < 7) {
        month = ''
        if (current.getDate() - date < 1) {
            date = ''
        } else {
            date = `${current.getDate() - date}天前  `
            hours = ''
            minutes = ''
        }
    } else {
        date += ' '
        hours = ''
        minutes = ''
    }

    return '' + year + month + date + hours + minutes
}