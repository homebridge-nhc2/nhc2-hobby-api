import { NHC2 } from '../src/NHC2';

const nhc2 = new NHC2('mqtts://192.168.0.216', {
    clientId: 'clientId',
    username: 'hobby',
    password: 'password',
    rejectUnauthorized: false,
});

(async () => {
    await nhc2.subscribe();

    nhc2.sendTriggerBasicStateCommand('start-stop-action-uuid');
})();

