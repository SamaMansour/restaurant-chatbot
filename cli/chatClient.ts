/* eslint-disable @typescript-eslint/no-explicit-any */
import * as readline from 'readline';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';


const API_URL = process.env.API_URL || 'http://localhost:3001/api';

class ChatClient {
  private sessionId: string;
  private rl: readline.Interface;

  constructor() {
    this.sessionId = uuidv4();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async start() {
    console.log('\n===========================================');
    console.log('   Restaurant Reservation Bot - CLI');
    console.log('===========================================\n');

    const response = await this.sendMessage('start');
    console.log(`\n${response}\n`);

    this.promptUser();
  }

  private promptUser() {
    this.rl.question('You: ', async (input) => {
      const message = input.trim();

      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        console.log('\nThank you for using Restaurant Reservation Bot. Goodbye!\n');
        this.rl.close();
        process.exit(0);
        return;
      }

      if (message.toLowerCase() === 'restart') {
        this.sessionId = uuidv4();
        console.log('\n--- New Session Started ---\n');
        const response = await this.sendMessage('start');
        console.log(`\n${response}\n`);
        this.promptUser();
        return;
      }

      if (message.toLowerCase() === 'menu') {
        const response = await this.sendMessage('menu');
        console.log(`\nBot: ${response}\n`);
        this.promptUser();
        return;
      }

      if (!message) {
        this.promptUser();
        return;
      }

      const response = await this.sendMessage(message);
      console.log(`\nBot: ${response}\n`);

      this.promptUser();
    });
  }

  private async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          message,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        return `Error: ${data.error || 'Unknown error occurred'}`;
      }

      return data.data.response;
    } catch (error: any) {
      return `Connection error: ${error.message}. Please ensure the server is running on ${API_URL}`;
    }
  }
}

const client = new ChatClient();
client.start();
