import puppeteer, { Browser, Page } from 'puppeteer-core';
import { PrismaClient } from '@prisma/client';
import path from 'path';

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

    try {
      // Determine executable path based on environment
      const executablePath = process.env.CHROME_BIN || 
        (process.platform === 'win32' 
          ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' 
          : '/usr/bin/chromium-browser');

      this.browser = await puppeteer.launch({
        executablePath,
        headless: true, // Use headless for server
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // 解决 Docker 内存不足
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote'
        ]
      });

      this.page = await this.browser.newPage();
      await this.page.setViewport({ width: 1280, height: 800 });
      
      // 设置 User-Agent 防止被识别为机器人
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Go to login page (Taobao login is often used for Xianyu)
      // Or Xianyu Web (2.taobao.com) which redirects to login
      this.log('Navigating to login page...');
      
      // 增加超时时间到 60秒
      await this.page.goto('https://login.taobao.com/member/login.jhtml?style=mini&from=idlefish', {
        waitUntil: 'networkidle2',
        timeout: 60000 
      });

      // Wait for QR code element
      // Note: Selectors change often. This is a best-effort attempt.
      // Usually there is a switch to QR code login mode if not default.
      // We assume default or try to click the QR icon.
      
      // Take screenshot of QR code area or full page
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
        // Take screenshot for frontend
        const screenshot = await this.page.screenshot({ encoding: 'base64' });
        this.qrCodeBase64 = `data:image/png;base64,${screenshot}`;

        // Check if logged in (url changes or specific element appears)
        if (this.page.url().includes('user_admin') || await this.page.$('.login-success-marker')) {
           this.status = 'running';
           this.qrCodeBase64 = null;
           this.log('Login successful!');
           break;
        }

        // Also check if we are redirected to the main page
        const title = await this.page.title();
        if (title.includes('闲鱼') && !title.includes('登录')) {
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
