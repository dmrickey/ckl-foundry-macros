const knowledges = [
    { key: 'kar', name: 'Arcana'},
    { key: 'kdu', name: 'Dungeoneering'},
    { key: 'ken', name: 'Engeoneering'},
    { key: 'kge', name: 'Geography'},
    { key: 'khi', name: 'History'},
    { key: 'klo', name: 'Local'},
    { key: 'kna', name: 'Nature'},
    { key: 'kno', name: 'Nobility'},
    { key: 'kpl', name: 'Planes'},
    { key: 'kre', name: 'Religion'},
];
const diceroll = RollPF.safeTotal('1d20');

const trained = [];
const untrained = [];

for (let k of knowledges) {
    const result = actor.getRollData().skills[k.key].mod + diceroll;
    if (actor.system.skills[k.key].rank) {
        trained.push(`&nbsp;&nbsp;${k.name}: [[${result}]]`);
    } else {
        untrained.push(`&nbsp;&nbsp;${k.name}: [[${Math.min(10, result)}]] (${result})`);
    }
}

const messages = [`Base roll [[${diceroll}]]`, '', 'Trained Knowledges:', ...trained, '', 'Untrained Knowledges:', ...untrained];

const chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: messages.join('<br />')
};
ChatMessage.create(chatData, {});
