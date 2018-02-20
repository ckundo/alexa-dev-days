var slotList = [{
    item: {
    name: "Age",
    value: 13
}}, {item: {
    name: "Interest",
    value: "Start war"
}}, {item:
{
    name: "Duration",
    value: "1hr"
}}
];
var userInput = getUserInput(slotList);
console.log(JSON.stringify(userInput));
var outputRecord = findMatchRecord(userInput);