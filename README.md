# nhc2-hobby-api 
[![Version](http://img.shields.io/npm/v/nhc2-hobby-api.png)](https://www.npmjs.org/package/nhc2-hobby-api)
[![License](https://img.shields.io/npm/l/nhc2-hobby-api.svg)](https://github.com/wvanvlaenderen/nhc2-hobby-api/blob/master/LICENSE)
[![Downloads](https://img.shields.io/npm/dt/nhc2-hobby-api.svg)](https://www.npmjs.org/package/nhc2-hobby-api)
[![Build Status](https://travis-ci.org/wvanvlaenderen/nhc2-hobby-api.svg?branch=master)](https://travis-ci.org/wvanvlaenderen/nhc2-hobby-api)
[![Coverage Status](https://coveralls.io/repos/github/wvanvlaenderen/nhc2-hobby-api/badge.svg?branch=master)](https://coveralls.io/github/wvanvlaenderen/nhc2-hobby-api?branch=master)
[![Dependencies](https://david-dm.org/wvanvlaenderen/nhc2-hobby-api.svg)](https://david-dm.org/wvanvlaenderen/nhc2-hobby-api)

As of October 29, 2019 Niko has published their [Hobby API](https://www.niko.eu/en/campaign/niko-home-control/hobby-api) which allows end users to control their Niko Home Control 2 installation through the MQTT protocol.

This library is a wrapper library around the [MQTT.js](https://github.com/mqttjs/MQTT.js) library exposing MQTT messages as a RxJS Observable stream. Events supported include:
* query available devices in a NHC2 installation
* listen on light status change
* listen on light brightness change

The library can also control your installation through commands. Commands supported include:
* toggle light status
* set light brightness level
* toggle generic switches (free start stop actions)

## Changes

You can read the complete history of changes in the 
[CHANGELOG](https://github.com/wvanvlaenderen/nhc2-hobby-api/blob/master/CHANGELOG.md).

## Known Issues

1. Currently we need to set the `rejectUnauthorized` option to false because we are unable to verify the Niko root CA which is not ideal. Feel free to look into this.

## Project Principles

This project has a few principles that have and will continue to guide its 
development.

1. **Dependency lean**. Try to keep the required dependencies to a minimum.
2. **Simple**. Using the library should be simple and straightforward 
following common conventions.
3. **Completeness** This library is a far way from being complete, but we aim to make this library feature complete based on the official Niko documentation.
4. **Homebridge** The intent of developing this library is to build a [homebridge plugin](https://github.com/wvanvlaenderen/homebridge-nhc2) on top of this library to support control of the installation through Apple HomeKit. This plugin still needs to be developed. When adding features feel free to include the feature in the homebridge plugin as well.

## Contributing

Contributions are welcome, particularly bug fixes and enhancements!
Refer to our [Contribution Guidelines](https://github.com/wvanvlaenderen/nhc2-hobby-api/blob/master/CONTRIBUTING.md) for details.

> Please note that Project owners reserve the right to accept or reject any PR
> for any reason.

## Code of Conduct

Before contributing or participating in the nhc2-hobby-api community please be sure to 
familiarize yourself with our project 
[CODE OF CONDUCT](https://github.com/wvanvlaenderen/nhc2-hobby-api/blob/master/CODE_OF_CONDUCT.md). 
These guidelines are intended to govern interactions with and within the nhc2-hobby-api 
community.

# Hobby API Documentation

The Hobby API encapusulated by this library is documented by Niko which can be found [here](https://mynikohomecontrol.niko.eu/Content/hobbyapi/documentation.pdf)
	
# Warranty Disclaimer

You may use this library with the understanding that doing so is 
**AT YOUR OWN RISK**. No warranty, express or implied, is made with regards 
to the fitness or safety of this code for any purpose. If you use this 
library to query or change settings of your installation you understand that it 
is possible to break your installation and may require the replace of devices or 
intervention of professionals of which costs cannot be returned by the project team.

> Please be careful not to use this library in a way that puts massive load on
> the Connected Controller of your NHC2 installation.
> Spamming the controller with a huge load of messages will stress the controller 
> and may reduce it's lifespan. For example prefer to use a push system for listening
> on changes instead of polling an accessory every x milliseconds.

# Installation

In order to use the library and/or samples you must first download and install
[NodeJS](http://nodejs.org). An installable [nhc2-hobby-api](https://www.npmjs.com/package/nhc2-hobby-api) module for [npm](http://npmjs.org) 
is available.

To download and install the library and all of its dependencies to a local 
project directory use the following:

    npm install nhc2-hobby-api

If you are building an npm package that depends upon this library then you 
will want to use the **--save** parameter in order to update the 
**package.json** file for your project. For example:

    npm install nhc2-hobby-api --save
    
If you prefer to download and install the library globally for all future 
node projects you may use:

    npm install -g nhc2-hobby-api

You may also install directly from the GitHub 
[source](https://github.com/wvanvlaenderen/nhc2-hobby-api). Either download and unzip 
the source, or clone the repository.

> Remember, whether you install via ZIP source or Git clone you must install 
> the dependencies before using nhc2-hobby-api.

To install dependencies via npm, from the root level of the library directory 
type:

    npm install

This library and its accompanying samples are still under development. New 
features, samples and bug fixes may be added regularly.  To ensure that 
you have the very latest version of nhc2-hobby-api and it's dependencies be sure to 
update frequently.

To do so, from your project directory type:

    npm update

# Library Usage Examples

## Connecting the Hobby API

Login in to [mynikohomecontrol](https://mynikohomecontrol.niko.eu/) and add the `Hobby API` to your connected services. This will provide you with a password which in formatted as a JWT token and valid for 1 year.
The following properties are set by Niko:
* The port is fixed to `8884`
* The username is fixed to `hobby`

```javascript
    var nhc2 = require('nhc2-hobby-api');
    
    var nhc2 = new nhc2.NHC2('mqtts://<IP_ADDRESS_OF_YOUR_CONNECTED_CONTROLLER>', {
        port: 8884,
        clientId: '<YOUR_UNIQUE_CLIENT_ID_NAME>',
        username: 'hobby',
        password: '<PASSWORD_PROVIDED_BY_MYNIKOHOMECONTROLL>',
        rejectUnauthorized: false,
    });
```

> Note: The clientId should be unique to the MQTT service provided by the Connected Controller. 
> If multiple connections with the same ClientId are running these will continuously 
> disconnect/reconnect and may skip MQTT messages since messages are not retained 
> and broadcasted with QoS set to 0.

We need to wait untill subscriptions to MQTT topics are completed before we are able to control the installation. This can be done using the `NHC2.prototype.subscribe` method which returns a promise.
```javascript
    nhc2.subscribe().then(function () {
        // Now you are ready to start querying NHC2
    });
```

Because of the async process we are dealing with when sending/receiving messages, and the possible callback hell, it is preffered to make use of the Javascript async/await syntax.
```javascript
    (async () => {
        await nhc2.subscribe();
        // Now you are ready to start querying NHC2
    })();

```
## Get a list of all connected accessories
```javascript
    var accessories = await nhc2.getAccessories();
```
> Note: currently only accesories of type `action` are returned since these 
> are the only accessories which we can control.

## Listen on incoming events

`NHC2.prototype.getEvents` will return an Observable stream containing incoming events.

```javascript
    nhc2.getEvents().subscribe(event => console.log(event));
```
> Note: currently only events controlling accessories of type `light` 
> or `dimmer` are returned.

## Change the status of an accesory

`NHC2.prototype.sendStatusChangeCommand` allows you to control the status of lights.

```javascript
    var light = accessories[21];
    nhc2.sendStatusChangeCommand(light.Uuid, true);
```

## Change the brightness of an accesory

`NHC2.prototype.sendStatusChangeCommand` allows you to control the status of lights.

```javascript
    var dimmableLight = accessories[21];
    nhc2.sendBrightnessChangeCommand(dimmableLight.Uuid, 0);
```
	
# Samples

A collection of samples is provided in the `samples` directory.  These demonstrate 
some basic usage scenarios for the library.  These samples are written in typescript, in order to run them you need to compile them first.

    cd samples
    tsc turn-on-all-lights.ts 
    node turn-on-all-lights.js 
    
    
