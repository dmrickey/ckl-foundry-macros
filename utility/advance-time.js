// I did not write this, I don't remember where I found it, but I'm storing it here because it is useful and I don't want to lose track of it

/**
 * Advances world time.
 *
 * Requires Foundry 0.8.x
 *
 * Helpful notes:
 * - This triggers updateWorldTime hook (which has parameters: [worldTime:number, worldTimeDiff:number]).
 * - Negative values are possible.
 */

// User configuration
const SETTINGS = {
	unit: 'minute', // 'second', 'minute', 'hour' ... needs to match key in TIME
	quantity: 1,
	commonChoices: {
		8: 'Basic rest hours',
		11: 'Advanced rest hours',
		30: '×½',
		60: '×1',
		180: '×3',
		300: '×5',
		600: '×10'
	}
};

// Translations
const LANG = {
	advanceTime: 'Advance Time',
	seconds: 'Seconds',
	minutes: 'Minutes',
	hours: 'Hours',
	advanced: '{quantity} {units}'
}

// Time units
const TIME = {
	second: {
		label: LANG.seconds,
		scale: 1,
	},
	minute: {
		label: LANG.minutes,
		scale: 60,
	},
	hour: {
		label: LANG.hours,
		scale: 60 * 60,
	}
};

const DATA = {
	listId: 'advance-time-dialog-common-options',
};

/** --- Actual Script --- */

class AdvanceTimeDialog extends Dialog {
	static open(quantity = 60, unit = 'second') {
		if (!game.user.isGM) return;

		const commonOptions = $(`<datalist id="${DATA.listId}">`)
		for (const [k, v] of Object.entries(SETTINGS.commonChoices)) {
			commonOptions.append(
				$(`<option value="${k}">${v}</option>`)
			);
		}

		const timeScaleOption = $('<select name="scale" data-dtype="Number" required>');
		for (const [_, v] of Object.entries(TIME)) {
			const selected = v.scale === TIME[unit].scale;
			timeScaleOption.append(
				$(`<option value="${v.scale}">${v.label}</option>`).attr({selected})
			);
		}
		timeScaleOption.val(`${TIME[unit].scale}`);

		const html = $('<form class="flexcol">')
			.append(
				$('<div class="flexrow">').append(
					$(`<input type="number" data-dtype="Number" step="1" name="quantity" value="${quantity}" list="${DATA.listId}">`),
					timeScaleOption,
				),
				$('<hr>'),
				commonOptions
			);

		return new Promise(
			(resolve) => new AdvanceTimeDialog(
				{
					title: LANG.advanceTime,
					content: html.get(0).outerHTML,
					buttons: {
						advance: {
							label: LANG.advanceTime,
							icon: '<i class="fas fa-hourglass-half"></i>',
							callback: ev => {
								const data = expandObject(new FormDataExtended(ev.find('form').get(0)).toObject());
								data.seconds = data.quantity * data.scale;
								resolve(data);
							},
						},
					},
					default: 'advance',
					onclose: _ => resolve(null)
				},
				{
					width: 360,
				}
			).render(true)
		);
	}
}

const signNum = (v) => Number.isFinite(v) ? v < 0 ? `${v}` : `+${v}` : v;

const rv = await AdvanceTimeDialog.open(SETTINGS.quantity, SETTINGS.unit);
if (rv && rv.seconds != 0) {
	rv.units = Object.values(TIME).find(t => t.scale === rv.scale)?.label ?? '???';
	const msg = LANG.advanced.replace(/{(\w+)}/g, function (_, v) {
		return signNum(rv[v]);
	});
	ui.notifications.info(msg);
	console.log('ADVANCE TIME:', msg);
	await game.time.advance(rv.seconds);
}
