import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';
import path from 'path';

puppeteer.use(StealthPlugin());

const prisma = new PrismaClient();

export class XianyuDriver {
  private browser: Browser | null = null;
  private page: Page | null = null;
  public qrCodeBase64: string | null = null;
  public status: 'stopped' | 'starting' | 'waiting_login' | 'running' | 'error' = 'stopped';
  public lastLog: string = '';

  private log(msg: string) {
    console.log(`[XianyuDriver] ${msg}`);
    this.lastLog = `${new Date().toLocaleTimeString()} - ${msg}`;
  }

  async start() {
    if (this.status !== 'stopped' && this.status !== 'error') return;
    this.status = 'starting';
    this.log('Starting browser...');

    // 彻底禁止 X11 转发请求
    delete process.env.DISPLAY;

    try {
      // Determine executable path based on environment
      const executablePath = process.env.CHROME_BIN || 
        (process.platform === 'win32' 
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
          : '/usr/bin/chromium-browser');

      // @ts-ignore - puppeteer-extra type compatibility issue
      this.browser = await puppeteer.launch({
        executablePath,
        // 使用 'new' 模式或 true 强制无头模式
        headless: 'new', 
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          // 关键：禁止显示 X11 窗口
          '--display=:0' 
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 800 });
      
      // 设置 User-Agent 防止被识别为机器人
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Go to Xianyu Web
      this.log('Navigating to goofish.com...');
      
      // 优化加载策略：只等待 DOM 加载完成，不等待所有资源（图片/广告）加载，防止超时
      await this.page.goto('https://www.goofish.com/', {
        waitUntil: 'domcontentloaded', 
        timeout: 60000 
      });

      // 寻找并点击登录按钮 (右上角 "登录")
      this.log('Clicking login button...');
      try {
        // 等待登录按钮出现 (通常是包含 "登录" 文本的元素)
        const loginBtn = await this.page.waitForSelector('.login-btn, button:has-text("登录"), a:has-text("登录")', { timeout: 5000 });
        if (loginBtn) {
            await loginBtn.click();
        } else {
            // 备用方案：通过文本查找
            const buttons = await this.page.$$('button, a');
            for (const btn of buttons) {
                const text = await btn.evaluate(el => el.textContent);
                if (text?.includes('登录')) {
                    await btn.click();
                    break;
                }
            }
        }
      } catch (e) {
          this.log('Could not find login button, checking if already login modal is open or different page structure');
      }

      // 等待登录弹窗出现
      await new Promise(r => setTimeout(r, 2000));

      this.status = 'waiting_login';
      this.log('Waiting for login...');
      
      // Loop to update QR code and check login status
      this.checkLoginLoop();

    } catch (error: any) {
      this.log(`Error starting driver: ${error.message || error}`);
      console.error(error); // 打印完整错误堆栈到控制台
      this.status = 'error';
      if (this.browser) await this.browser.close();
    }
  }

  async checkLoginLoop() {
    if (!this.page) return;

    let attempts = 0;
    while (this.status === 'waiting_login' && attempts < 100) {
      try {
        // 尝试定位二维码元素 (canvas 或 img)
        // 闲鱼/淘宝登录弹窗通常有特定的 class，如 .qrcode-img, canvas 等
        let qrElement = await this.page.$('canvas');
        if (!qrElement) {
            qrElement = await this.page.$('.qrcode-img img, img[src*="qr"]');
        }

        let screenshot;
        if (qrElement) {
            // 如果找到了二维码元素，只截取该元素
            screenshot = await qrElement.screenshot({ encoding: 'base64' });
        } else {
            // 找不到则截取全屏
            screenshot = await this.page.screenshot({ encoding: 'base64' });
        }
        
        this.qrCodeBase64 = `data:image/png;base64,${screenshot}`;

        // Check if logged in
        // 1. Check for specific user elements (avatar, user id)
        // 2. Check for redirect to user center
        const isLoggedIn = await this.page.evaluate(() => {
            // 闲鱼/淘宝登录后通常会有用户信息元素
            return !!document.querySelector('.login-info') || 
                   !!document.querySelector('.site-nav-user') ||
                   window.location.href.includes('user_admin') ||
                   document.cookie.includes('cookie2='); // 简单判断 cookie 存在
        });

        if (isLoggedIn) {
           this.status = 'running';
           this.qrCodeBase64 = null;
           this.log('Login successful (detected by page element)!');
           break;
        }

        // Also check if we are redirected to the main page
        const title = await this.page.title();
        // 之前的逻辑太宽松，只要标题不含"登录"就认为成功，导致误判。
        // 现在移除这个宽松判断，或者改为检测特定页面标题
        if (title.includes('卖家中心') || title.includes('我的闲鱼')) {
            this.status = 'running';
            this.qrCodeBase64 = null;
            this.log('Login successful (detected by title)!');
            break;
        }

        await new Promise(r => setTimeout(r, 2000));
        attempts++;
      } catch (e) {
        console.error(e);
        break;
      }
    }
  }

  async checkOrders() {
    if (this.status !== 'running' || !this.page) return [];
    
    try {
      // Navigate to order management page
      // This URL is hypothetical; actual Xianyu web management might be different
      // or require mobile simulation.
      // For this demo, we assume a "sold items" page exists.
      await this.page.goto('https://2.taobao.com/user_admin/sold_list.htm', { waitUntil: 'domcontentloaded' });
      
      // Extract orders
      // This evaluation runs in the browser context
      const orders = await this.page.evaluate(() => {
        const items = document.querySelectorAll('.order-item'); // Hypothetical selector
        return Array.from(items).map(item => ({
          orderNo: item.getAttribute('data-id'),
          buyerName: item.querySelector('.buyer-name')?.textContent,
          productTitle: item.querySelector('.item-title')?.textContent,
          status: item.querySelector('.status')?.textContent
        }));
      });

      return orders;
    } catch (e) {
      this.log(`Error checking orders: ${e}`);
      return [];
    }
  }

  async sendMessage(orderNo: string, message: string) {
    if (this.status !== 'running' || !this.page) return false;
    this.log(`Sending message to ${orderNo}`);
    // Implement sending logic...
    return true; 
  }

  async markShipped(orderNo: string) {
    if (this.status !== 'running' || !this.page) return false;
    this.log(`Marking ${orderNo} as shipped`);
    // Implement shipping logic...
    return true;
  }
  
  async setCookies(cookies: string) {
    if (!this.browser) {
        await this.start();
        // Wait for browser to init
        await new Promise(r => setTimeout(r, 2000));
    }
    
    if (this.page) {
        this.log('Setting manual cookies...');
        // cookies string format: "key1=value1; key2=value2"
        const cookieObjects = cookies.split(';').map(pair => {
            const [name, value] = pair.trim().split('=');
            return { name, value, domain: '.taobao.com' }; // Default to taobao domain
        }).filter(c => c.name && c.value);

        await this.page.setCookie(...cookieObjects);
        await this.page.reload();
        this.status = 'running';
        this.log('Cookies set manually. Driver running.');
        return true;
    }
    return false;
  }
  
  async stop() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    this.status = 'stopped';
    this.log('Driver stopped');
  }
}

export const xianyuDriver = new XianyuDriver();
