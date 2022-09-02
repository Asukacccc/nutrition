export default function (obj) {
    let datePart = ''
    const date = new Date()

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    if (year !== obj[0] / 1) {
        datePart = `${obj[0]}年${obj[1]}月${obj[2]}日`
    } else {
        if (month !== obj[1] / 1) {
            datePart = `${obj[1]}月${obj[2]}日`
        } else {
            if (day !== obj[2] / 1) {
                datePart = `${obj[2] / 1}日`
            }
        }
    }

    return `${datePart} ${obj[3]}:${obj[4]}`
}