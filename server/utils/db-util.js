const mysql = require('mysql')
const config = require('../../config')
const { database } = config

const pool = mysql.createPool({
    host: database.HOST,
    port: database.PORT,
    user: database.USERNAME,
    password: database.PASSWORD,
    database: database.DATABASE
})

module.exports.query = async (sql, values) => {
    console.debug(`\t ${sql}\n\t`, values)

    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                console.error(err)
                reject(err)
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        console.error(err)
                        reject(err)
                    } else {
                        resolve(rows)
                    }
                    connection.release()
                })
            }
        })
    })
}

module.exports.insert = async (table, model, resInsertId = false) => {
    let { paramStr, paramValues } = Object.keys(model).reduce((reduceRes, item) => {
        reduceRes.paramValues.push(model[item])
        reduceRes.paramStr += `${item}=?,`
        return reduceRes
    }, {paramStr: '', paramValues: []})
    if (!paramStr) {
        console.error(`数据插入失败 table=${table}`, model)
        if (resInsertId) {
            return -1
        }
        return false
    }
    paramStr = paramStr.substr(0, paramStr.length - 1)
    const sql = `INSERT IGNORE INTO ${table} SET ${paramStr}`
    const { affectedRows, insertId } = await module.exports.query(sql, paramValues)
    const success = affectedRows >= 1
    if (!resInsertId) {
        return success
    }
    if (success) {
        return insertId
    }
    return -1
}

module.exports.insertGetId = async (table, model) => {
    return await module.exports.insert(table, model, true)
}

module.exports.update = async (table, model, where = '1=1', values = []) => {
    let { paramStr, paramValues } = Object.keys(model).reduce((reduceRes, item) => {
        reduceRes.paramValues.push(model[item])
        reduceRes.paramStr += `${item}=?,`
        return reduceRes
    }, {paramStr: '', paramValues: []})

    if (!paramStr) {
        console.error(`数据更新失败 table=${table}`, model, where, values)
        return false
    }
    paramStr = paramStr.substr(0, paramStr.length - 1)

    const sql = `UPDATE ${table} SET ${paramStr} WHERE ${where}`
    /**
     * {
          fieldCount: 0,
          affectedRows: 1,
          insertId: 0,
          serverStatus: 2,
          warningCount: 0,
          message: '(Rows matched: 1  Changed: 0  Warnings: 0',
          protocol41: true,
          changedRows: 0
       }
     */
    const { affectedRows } = await module.exports.query(sql, [...paramValues, ...values])
    return affectedRows >= 1
}

module.exports.remove = async (table, where = '1=1', values = []) => {
    const sql = `DELETE FROM ${table} WHERE ${where}`
    const {affectedRows} = await module.exports.query(sql, values)
    return affectedRows >= 1
}

module.exports.queryForObj = async (table, cols = '*', where = '1=1', values = []) => {
    const sql = `SELECT ${cols} FROM ${table} WHERE ${where} LIMIT 1`
    const [res] = await module.exports.query(sql, values)
    return res
}

module.exports.queryForList = async (table, cols = "*", where = '1=1', values = []) => {
    const sql = `SELECT ${cols} FROM ${table} WHERE ${where}`
    return await module.exports.query(sql, values)
}

module.exports.count = async (table, where = '1=1', values = []) => {
    const sql = `SELECT COUNT(1) total_count FROM ${table} WHERE ${where}`
    const [record] = await module.exports.query(sql, values)
    const { total_count } = record
    return total_count
}

module.exports.mapToDbParams = map => {
    return Object.entries(map).reduce((reduceRes, [key, value]) => {
        reduceRes.where += ` AND ${key}=?`
        reduceRes.values.push(value)
        return reduceRes
    }, {where: '1=1', values: []})
}
