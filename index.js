/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const jsonData = require('./data.json');
const APP_ID = process.env.APPLICATION_ID; // TODO replace with your app ID (OPTIONAL).
var recipes = require("./recipes");
var moment = require("moment");

const languageStrings = {
    'en': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'Block Finder',
            WELCOME_MESSAGE: "Welcome to %s. I'll help find a block set for you.",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - Recipe for %s.',
            HELP_MESSAGE: "You can say recommend me a block set.",
            HELP_REPROMPT: "You can say recommend me a block set.",
            STOP_MESSAGE: 'Goodbye!',
            RECIPE_REPEAT_MESSAGE: 'Try saying repeat.',
            NOT_FOUND_MESSAGE: "I\'m sorry, I don\'t know ",
            NOT_FOUND_REPROMPT: 'What else can I help with?',
        },
    },
    'en-US': {
        translation: {
            RECIPES: recipes.RECIPE_EN_US,
            SKILL_NAME: 'Block Finder',
        },
    },
    'en-GB': {
        translation: {
            RECIPES: recipes.RECIPE_EN_GB,
            SKILL_NAME: 'Block Finder',
        },
    },
    'de': {
        translation: {
            RECIPES: recipes.RECIPE_DE_DE,
            SKILL_NAME: 'Assistent für Minecraft in Deutsch',
            WELCOME_MESSAGE: 'Willkommen bei %s. Du kannst beispielsweise die Frage stellen: Welche Rezepte gibt es für eine Truhe? ... Nun, womit kann ich dir helfen?',
            WELCOME_REPROMPT: 'Wenn du wissen möchtest, was du sagen kannst, sag einfach „Hilf mir“.',
            DISPLAY_CARD_TITLE: '%s - Rezept für %s.',
            HELP_MESSAGE: 'Du kannst beispielsweise Fragen stellen wie „Wie geht das Rezept für“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
            HELP_REPROMPT: 'Du kannst beispielsweise Sachen sagen wie „Wie geht das Rezept für“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
            STOP_MESSAGE: 'Auf Wiedersehen!',
            RECIPE_REPEAT_MESSAGE: 'Sage einfach „Wiederholen“.',
            NOT_FOUND_MESSAGE: 'Tut mir leid, ich kenne derzeit ',
            NOT_FOUND_REPROMPT: 'Womit kann ich dir sonst helfen?',
        },
    },
};

const handlers = {
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
  'RecommendationIntent': function() {
    console.warn("slots: ", JSON.stringify(this.event.request.intent.slots));
    var age = parseInt(this.event.request.intent.slots.age.value);
    var rawDuration = this.event.request.intent.slots.duration.value;
    var duration = moment.duration(rawDuration);
    var minutes = duration.asMinutes();
    var interest = this.event.request.intent.slots.interest.value;
    var slotList = { age: age, duration: minutes, interest: interest};
    var responseObject = findMatchRecord(slotList);

    if (responseObject) {
      var src = interest.toLowerCase() === "star wars" ? "https://s3.amazonaws.com/alexa-dev-days-block-finder/lightsaber_converted.mp3" : "https://s3.amazonaws.com/alexa-dev-days-block-finder/wizard_converted.mp3";
      var speechOutput = `<audio src=\'${src}\' />I recommend the ${responseObject.name}`;
    } else {
      var speechOutput = this.t('NOT_FOUND_MESSAGE');
      var repromptSpeech = this.t('NOT_FOUND_REPROMPT');
      speechOutput += repromptSpeech;

      this.attributes.speechOutput = speechOutput;
      this.attributes.repromptSpeech = repromptSpeech;
      this.response.speak(speechOutput).listen(repromptSpeech);
      console.log("== RESPONSE ==", JSON.stringify(this.handler.response));
      // this.emit(':ask', speechOutput, repromptSpeech);
      this.emit(":responseReady");
    }

    this.attributes.speechOutput = speechOutput;
    this.emit(':tell', speechOutput);
  },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
};

function findMatchRecord(userInputJsonObject) {
    let responseResult = jsonData.filter(record => {
        return isValidGenre(userInputJsonObject, record) && isInDurationRange(userInputJsonObject, record) && isInAgeRange(userInputJsonObject, record)
    });
    return responseResult.length > 0 ? responseResult[0] : null;
}

function isValidGenre(userInputJsonObject, record) {
    return record.genre.toUpperCase() === userInputJsonObject.interest.toUpperCase();
}

function isInDurationRange(userInputJsonObject, record) {
    return userInputJsonObject.duration <= record.maxDuration && userInputJsonObject.duration >= record.minDuration;
}

function isInAgeRange(userInputJsonObject, record) {
    return userInputJsonObject.age <= record.maxAge && userInputJsonObject.age >= record.minAge;
}

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
