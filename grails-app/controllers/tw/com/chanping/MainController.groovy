package tw.com.chanping
import grails.converters.JSON
import groovy.sql.Sql

import java.text.SimpleDateFormat

class MainController {

	def dataSource
	def index() {
		def responList = []
		return [opitems:responList]
	}
	def opitem() {}

	def dateFormatForDB = new SimpleDateFormat("yyyy-MM-dd")
	
	/**
	 * 訂購單事件
	 * @return
	 */
	def getSitemEvents(){
		def start = params.start
		def end = params.end
		println end
		if(!end){
			//get last day of month
			Calendar calendar = Calendar.getInstance()
			calendar.setTime(dateFormatForDB.parse(start))
			calendar.set(Calendar.DATE, calendar.getActualMaximum(Calendar.DATE));
			end = dateFormatForDB.format(calendar.getTime())
		}
		def params = [start, end]
		def sql = new Sql(dataSource)
		//def sqlQuery = "select DISTINCT c.CTMNAME,s.SALCNO,s.SHIPDATE from sitem s LEFT JOIN ctm c on s.ctmno=c.ctmno "+
		//		"where SHIPDATE between datetime("+start+") and datetime("+end+")"
		def sqlQuery = "select DISTINCT c.CTMNAME,s.SALCNO,s.SHIPDATE from st_sitem s LEFT JOIN st_ctm c on s.ctmno=c.ctmno " +
				"where SHIPDATE between convert(varchar, ?, 23) and convert(varchar, ?, 23)"
		println sqlQuery
		def rows = sql.rows(sqlQuery, params);

		def resList = []
		rows.each { c ->
			def res = [:]
			res['id'] = c.SALCNO?.trim()
			res['title'] = c.ctmname?.trim()
			res['start'] =c.SHIPDATE
			def params2 = [res['id']]
			sqlQuery = "select GOODNO,TRADEQTY,SHIPQTY from st_sitem s LEFT JOIN st_ctm c on s.ctmno=c.ctmno "+
				"where s.SALCNO=?"
			println sqlQuery
			def rows2 = sql.rows(sqlQuery,params2)
			res['desc'] = ""
			res['isCompleted'] = "Y"
			rows2.each { row ->
				res['desc'] += row.GOODNO?.trim()+" 數量:"+row.TRADEQTY.toInteger()+"\n"
				if(row.TRADEQTY>row.SHIPQTY){
					res['isCompleted'] = "N"
				}
			}
			resList.add res
		}
		sql.close()

		log.debug "end~~~~~~~~~"

		render resList as JSON
	}
	
	/**
	 * 訂購單事件
	 * @return
	 */
	def getSitemEvent() {
		def tradeno = params.tradeno
		def responList = []
		if(tradeno){
			int i = 1
			def sql = new Sql(dataSource)
			def params = [tradeno]
			def rows = sql.rows("select c.CTMNAME,c.TEL1,c.TEL2,s.SALCNO,s.CTMNO,s.SHIPDATE,s.GOODNO,g.GOODNAME,TRADEQTY,SHIPQTY from st_sitem s LEFT JOIN st_ctm c on s.ctmno=c.ctmno LEFT JOIN st_goods g ON s.goodno=g.goodno "+
					"where s.SALCNO=? ",params)
			rows.each { c ->
				def res = [:]
				res['sn'] = i++
				res['TRADEQTY'] = c.TRADEQTY
				res['SHIPQTY'] = c.SHIPQTY
				res['GOODNO'] = c.GOODNO?.trim()
				res['GOODNAME'] = c.GOODNAME?.trim()
				responList.add res
			}
			sql.close()
		}
		render responList as JSON
	}
	
	/**
	 * 銷貨單事件
	 * @return
	 */
	def getOpitemEvents(){
		def start = params.start
		def end = params.end
		println end
		if(!end){
			//get last day of month
			Calendar calendar = Calendar.getInstance()
			calendar.setTime(dateFormatForDB.parse(start))
			calendar.set(Calendar.DATE, calendar.getActualMaximum(Calendar.DATE));
			end = dateFormatForDB.format(calendar.getTime())
		}
		def sql = new Sql(dataSource)
		def params = [start, end]

		def sqlQuery = "select DISTINCT c.CTMNAME,o.TRADENO,o.TRADEDATE from st_opitem o LEFT JOIN st_ctm c on o.ctmno=c.ctmno "+
				"where TRADEDATE between convert(varchar, ?, 23) and convert(varchar, ?, 23)"
		println sqlQuery
		def rows = sql.rows(sqlQuery,params)

		def resList = []
		rows.each { c ->
			def res = [:]
			res['id'] = c.TRADENO?.trim()
			res['title'] = c.ctmname?.trim()
			res['start'] =c.TRADEDATE
			def params2 = [res['id']]
			def rows2 = sql.rows("select o.GOODNO,GOODNAME,TRADEQTY from st_opitem o LEFT JOIN st_ctm c on o.ctmno=c.ctmno LEFT JOIN st_goods g ON o.goodno=g.goodno "+
				"where o.TRADENO=?", params2)
			res['desc'] = ""
			rows2.each { row ->				
				res['desc'] += row.GOODNAME?.trim()+" 數量:"+row.TRADEQTY.toInteger()+"\n"				
			}			
			resList.add res
		}
		sql.close()

		log.debug "end~~~~~~~~~"

		render resList as JSON
	}

	/**
	 * 銷貨單事件
	 * @return
	 */
	def getOpitemEvent() {
		def tradeno = params.tradeno
		def responList = []
		if(tradeno){
			int i = 1
			def sql = new Sql(dataSource)
			def params = [tradeno]
			def rows = sql.rows("select c.CTMNAME,c.TEL1,c.TEL2,o.TRADENO,o.CTMNO,o.TRADEDATE,o.GOODNO,GOODNAME,TRADEQTY from st_opitem o LEFT JOIN st_ctm c on o.ctmno=c.ctmno LEFT JOIN st_goods g ON o.goodno=g.goodno "+
					"where o.TRADENO=?", params)
			rows.each { c ->
				def res = [:]
				res['sn'] = i++
				res['TRADEQTY'] = c.TRADEQTY
				res['GOODNO'] = c.GOODNO?.trim()
				res['GOODNAME'] = c.GOODNAME?.trim()
				responList.add res
			}
			sql.close()
		}
		render responList as JSON
	}
}