const inquirer = require('inquirer');
const { exec } = require('child_process');
const fs = require('fs-extra');
const chalk = require('chalk');
const { get } = require('axios');
const { version } = require('../package.json');
const warning = chalk.hex('#FFA500');
const error = chalk.whiteBright.bgRed;

module.exports = {
  // 选择器
  choose(message) {
    return inquirer.prompt(message);
  },
  // 安装命令
  exe(command) {
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        if (err) {
          console.log('\n', error(' ERROR '), chalk.red(`${command} 失败`));
          process.exit(1);
        } else {
          resolve(stdout);
        }
      });
    });
  },

  /**
   * @description: 将文件内容写入文件
   * @param {string} project - 项目文件路径
   * @param {string} template - 模板内容
   * @return {Promise}
   */
  cp(project, template) {
    return new Promise((resolve, reject) => {
      fs.outputFile(project, template)
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  },
  /**
   * @description: 将模板写到项目中
   * @param {string} project - 项目文件路径
   * @param {string} template - 模板路径
   * @return {void}
   */
  copy(project, template) {
    fs.copy(template, project, err => {
      if (err) {
        console.log('\n', error(' ERROR '), chalk.red(err));
        process.exit(1);
      }
    });
  },
  // 读文件
  read(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, function (err, data) {
        if (err) {
          console.log('\n', error(' ERROR '), chalk.red(err));
          return process.exit(1);
        }
        resolve(data.toString());
      });
    });
  },
  // 判断是不是最新版本
  async getVersion() {
    const { data: res } = await get('https://registry.npmmirror.com/@feiyuhao/vite_cli').catch(
      err => {
        process.exit(1);
      }
    );
    if (version !== res['dist-tags'].latest) {
      return console.log(
        warning(
          `最新版本:${res['dist-tags'].latest},当前版本:${version},请运行 npm i @feiyuhao/vite_cli -g 更新`
        )
      );
    }
  },
  // 判断包项目使用的包管理工具
  tools() {
    return new Promise((resolve, reject) => {
      fs.pathExists('./package-lock.json', (err, exists) => {
        if (err) {
          return console.error(error(' ERROR '), chalk.red(err));
        }
        if (exists) {
          resolve('npm');
        } else {
          fs.pathExists('./yarn.lock', (err, exists) => {
            if (err) {
              return console.error(error(' ERROR '), chalk.red(err));
            }
            if (exists) {
              resolve('yarn');
            } else {
              fs.pathExists('./pnpm-lock.yaml', (err, exists) => {
                if (err) {
                  return console.error(error(' ERROR '), chalk.red(err));
                }
                if (exists) {
                  resolve('pnpm');
                } else {
                  resolve('npm');
                }
              });
            }
          });
        }
      });
    });
  }
};
