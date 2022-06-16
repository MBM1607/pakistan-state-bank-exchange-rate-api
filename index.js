import chalk from 'chalk';
import { PdfReader } from 'pdfreader';
import { readFile } from 'fs/promises';
import dayjs from 'dayjs';
import Downloader from 'nodejs-file-downloader';
import cliProgress from 'cli-progress';


const getUsdPrice = async (filename) => {
  let cursor = false;
  const buffer = await readFile(filename);

  new PdfReader().parseBuffer(buffer, (error, item) => {
    if (error) console.error(chalk.red(`error: ${error}`));
    else if (item?.text && cursor) {
      const usdPrice = parseFloat(item.text).toFixed(2);
      cursor = false;
      console.log(`USD TO PKR: ${usdPrice}`);
    }
    else if (item?.text === 'USD') {
      cursor = true
    };
  });
}

// Download the given date's exchange rate
const downloadFile = async (date) => {
  const [_, month, year] = date.split('-');
  const url = `https://www.sbp.org.pk/ecodata/rates/war/${year}/${month}/${date}.pdf`;

  // Progress bar
  const bar = new cliProgress.SingleBar({
    format: 'Downloading... {bar} {percentage}%'
  }, cliProgress.Presets.shades_classic);

  const downloader = new Downloader({
    url: url,
    onProgress: (percentage) => {
      // Gets called with each chunk.
      bar.update(percentage);
    }
  })

  try {
    bar.start(100, 0);
    await downloader.download();
    downloader.cancel();
    bar.update(100);
    bar.stop();
    console.info(chalk.green(`Exchange rate for: ${date} are downloaded.`));

    getUsdPrice(`${today}.pdf`);
  }
  catch (error) {
    bar.stop();

    console.error(chalk.red('Download failed!!', error));
    console.debug(`URL: ${url}`);
  }
};

// Get today's date
const today = dayjs().format('DD-MMM-YYYY');

downloadFile(today);
