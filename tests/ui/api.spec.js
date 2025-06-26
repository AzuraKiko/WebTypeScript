import { test, expect } from '@playwright/test';
import ApiHelper from '../../helpers/ApiHelper.ts';

test('check API', async ({ request }) => {
    const url = "https://uat-gateway.pinetree.com.vn/market/public/stock/top?type=TOP_VOLUME&exchange=HOSE&tradingValue=5000000&limit=1"
    const response = await request.get(url);
    const data = await response.json();
    expect(response.status()).toBe(200);
    console.log(data);

});

test('check API booking', async ({ request }) => {
    const url = "https://restful-booker.herokuapp.com/auth"
    const response = await request.post(url, {
        data: {
            "username": "admin",
            "password": "password123"
        }
    })

    const data = await response.json();
    expect(response.status()).toBe(200);
    console.log(data);

});

test('check get booling', async ({ request }) => {
    const url = "https://restful-booker.herokuapp.com/booking"
    const response = await request.get(url);
    const data = await response.json();
    expect(response.status()).toBe(200);
    console.log(data);
});

test('Login API should return token', async () => {
    const api = new ApiHelper({ baseUrl: 'https://restful-booker.herokuapp.com' });
    const data = { username: 'admin', password: 'password123' };
    const response = await api.post('/auth', data);
    expect(response.token).toBeTruthy();
    const token = response.token;
    console.log(token);
    api.setAuthToken(token); // Đặt Authorization header cho các request sau

});

test('Login Pine', async () => {
    const api = new ApiHelper({ baseUrl: 'http://10.8.90.16:8888' });
    const data = {
        user: "010C000357",
        pass: "jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=",
        device: "",
        fcmToken: "010C000357",
        lang: "vn"
    }
    const response = await api.post('/loginAdv', data);
    expect(response).toBeTruthy();
    console.log(response);

})

test("Login", async ({ request }) => {
    const url = "http://10.8.90.16:8888/loginAdv"
    const response = await request.post(url, {
        header: {
            "Content-Type": "application/json"
        },
        data: {
            user: "010C000357",
            pass: "jZae727K08KaOmKSgOaGzww/XVqGr/PKEgIMkjrcbJI=",
            device: "",
            fcmToken: "010C000357",
            lang: "vn"
        }``
    });

    expect(response.ok).toBeTruthy();
    const data = await response.json();
    console.log(data);
})
