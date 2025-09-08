import { Injectable } from '@angular/core';
import {JSEncrypt} from 'jsencrypt';

@Injectable({
  providedIn: 'root'
})
export class JsEncryptService {
  private encryptor: JSEncrypt;

  constructor() {
    this.encryptor = new JSEncrypt();
  }

  setPublicKey(publicKey: string) {
    this.encryptor.setPublicKey(publicKey);
  }

  encrypt(data: string): string {
    return this.encryptor.encrypt(data) as string;
  }

  setPrivateKey(privateKey: string) {
    this.encryptor.setPrivateKey(privateKey);
  }

  decrypt(encrypted: string): string | false {
    return this.encryptor.decrypt(encrypted);
  }

  test(): void {
    console.log('JsEncryptService is working');
  }
}
