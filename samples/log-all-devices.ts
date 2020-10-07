import {NHC2} from '../src/NHC2';

const nhc2 = new NHC2('mqtts://192.168.0.216', {
    port: 8884,
    clientId: 'clientId',
    username: 'hobby',
    password: 'password',
    rejectUnauthorized: false,
});

(async () => {
    await nhc2.subscribe();

    const accessories = await nhc2.getAccessories();
    accessories.forEach(accessory => console.log(accessory));
})();

