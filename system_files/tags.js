const Discord = require('discord.js');

exports.get = () => {
    tags = ({
	"FBI": "Federal Bureau of Investigation",
	"LSPD": "Сотрудник LSPD",
	"SFPD": "Сотрудник SFPD",
	"RCSD": "Сотрудник RCSD",
	"LVPD": "Сотрудник LVPD",

	"LSa": "Военнослужащий LS",
	"SFa": "Военнослужащий SF",
	"JLV": "Надзиратель Jail LV",

	"MCLS": "Мед. работник MCLS",
	"MCSF": "Мед. работник MCSF",
	"MCLV": "Мед. работник MCLV",

	"CNN LS": "Сотрудник радиоцентра LS",
	"CNN SF": "Сотрудник радиоцентра SF",
	"CNN LV": "Сотрудник радиоцентра LV",

	"CBLS": "Сотрудник Банка LS",
	"DS": "Сотрудник Автошколы",
	"GOV": "Сотрудник Правительствa",

	"Yakuza": "Член мафии Yаkuzа",
	"WMC": "Warlock MC",
	"LCN": "La Cosa Nostra",
	"RM": "Russian Mafia",
    });
    return tags;
};
