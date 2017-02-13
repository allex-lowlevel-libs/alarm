function createAlarm(isArray,isFunction){

  function Alarm(prophash){
    /** prophash structure
     * {
     *   job_interval : 15*1000,
     *   reminders : [
     *     {
     *       hours : [1,3,5,7,9,11,13,15,17,19,21,23],
     *       cb : function do(a,b,c){}
     *     },
     *     {
     *       hours : [19,21,23],
     *       cb : function do2(a){}
     *     }
     *   ]
     * }
     **/
    this.job_interval = prophash.job_interval || 15 * 1000;
    if (!isArray(prophash.reminders)){
      throw new Error('Reminders field in prophash must be an array!');
    }
    this.reminders = prophash.reminders;
    this.doCronJob();
  }

  Alarm.prototype.destroy = function(){
    this.reminders = null;
    this.job_interval = null;
  };

  function checkTime(delta,milestone){
    var now = new Date();
    var nowMillis = now.getTime();
    if ((now.getHours() < milestone) && (new Date(nowMillis + delta).getHours() >= milestone)){
      //1 period behind milestone
      return -1;
    }
    if ((new Date(nowMillis - delta).getHours() < milestone) && (now.getHours() >= milestone)){
      //1 period after milestone
      return 1;
    }
    //0, invalid
    return 0;
  }

  Alarm.prototype.checkIfExecutionTime = function(cb,time){
    if (checkTime(this.job_interval,time) === 1){
      cb();
    }
  };

  Alarm.prototype.onReminderExecution = function(reminder){
     if (!isArray(reminder.hours)){
       throw new Error('Hours field must be an array!');
     }
     if (!isFunction(reminder.cb)){
       throw new Error('cb field must be a function!');
     }
     reminder.hours.forEach(this.checkIfExecutionTime.bind(reminder.cb));
  };

  Alarm.prototype.executeReminders = function(){
    this.reminders.forEach(this.onReminderExecution.bind(this));
  };

  Alarm.prototype.cronJob = function(){
    this.executeReminders();
    this.doCronJob();
  };

  Alarm.prototype.doCronJob = function(){
    setTimeout(this.cronJob.bind(this),this.job_interval);
  };

  return Alarm;

}

module.exports = createAlarm;
