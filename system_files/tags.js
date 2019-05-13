const Discord = require('discord.js');

exports.get = () => {
    tags = ({
		"LSPD": "Сотрудник LSPD",
		"SFPD": "Сотрудник SFPD",
		"RCSD": "Сотрудник RCSD",
		"LVPD": "Сотрудник LVPD",
		
		"LSa": "Военнослужащий LSa",
		"SFa": "Военнослужащий SF",
		"JLV": "Надзиратель Jail LV",
		
		"CNN LS": "Мед.работник MCLS",
		"CNN SF": "Мед.работник MCSF",
		"CNN LV": "Мед.работник MCLV",
		
		"CNN LS": "Сотрудник радиоцентра LS",
		"CNN SF": "Сотрудник радиоцентра SF",
		"CNN LV": "Сотрудник радиоцентра LV",
		
		"CBLS": "Сотрудник Банка LS",
		"DS": "Сотрудник Автошколы",
		"Gov": "Сотрудник Правительства",
		
		"FBI": "Federal Bureau of Investigation",
		
		"Yakuza": "Yakuza",
		"WMC": "Warlock MC",
		"LCN": "La Cosa Nostra",
		"RM": "Russian Mafia",
    });
    return tags;
};
