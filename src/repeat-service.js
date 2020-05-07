const cron = require('node-cron');
const logger = require('./logger');

class RepeatService {
  constructor(broadcastService) {
    this.frequency = '';
    this.timesRepeated = '';
    this.broadcastService = broadcastService;
    this.count = 0;
  }

  setFrequency(frequency) {
    this.frequency = frequency;
  }

  setTimesRepeated(timesRepeated) {
    this.timesRepeated = timesRepeated;
  }

  repeatMessage(vGroupID) {
    logger.debug('Enter asyncStatus ');
    const timeString = `*/${this.frequency} * * * * *`;
    const cronJob = cron.schedule(timeString, () => {
      logger.debug('Running cronjob');
      this.broadcastService.broadcastMessage(vGroupID);
      this.count += 1;
      if (this.count === this.timesRepeated) {
        return cronJob.stop();
      }
      return false;
    });
    cronJob.start();
  }
}

module.exports = RepeatService;
