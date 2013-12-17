var RoleImp = {};
(function () {
	RoleImp.EventTrain = function () {
		if (Math.floor((Math.random() * 5) + 1) != 1) {
			return;
		}
		var game = GameManager.company.gameLog.last;
		var staffMember = GameManager.company.staff.skip(0).pickRandom();
		var staffName = staffMember.name;
		var statAmount = Math.floor((Math.random() * 15) + 3);
		var stat = Math.floor((Math.random() * 4) + 1);
		var sv = statAmount / 500;
		switch (stat) {
		case 1:
			staffMember.designFactor += sv;
			stat = "Design";
			break;
		case 2:
			staffMember.technologyFactor += sv;
			stat = "Technology";
			break;
		case 3:
			staffMember.speedFactor += sv;
			stat = "Speed";
			break;
		case 4:
			staffMember.researchFactor += sv;
			stat = "Research";
			break;
		default:
			return GameManager.company.notifications.push(new Notification("Train Event".localize(), "Trained event errored."));
		}

		var message = "Whilst working on " + game.title + " " + staffName + " improved their " + stat + " ability by " + statAmount + "!".localize().format(staffMember.name);
		GameManager.company.notifications.push(new Notification("Staff Improved!".localize(), message));
		return;
	};

	RoleImp.EventLottery = function () {
		if (GDT.getDataStore("RoleImp").data.lotto !== true) {
		if (Math.floor((Math.random() * 17000) + 1) == 1) {
			var win = Math.floor((Math.random() * 50000000) + 1000000);
			GameManager.company.notifications.push(new Notification("You won the lottery!".localize(), "WOW, You had the winning ticket. You won " + win.toLocaleString() + "Cr."));
			
			return GameManager.company.adjustCash(win, "Lottery");
			GDT.getDataStore("RoleImp").data.lotto = true;
		}else {return;}
		
		}
		GDT.off(GDT.eventKeys.gameplay.weekProceeded, RoleImp.EventLottery);
		return;
	};

	RoleImp.Stolen = function () {
		if (GDT.getDataStore("RoleImp").data.stolen !== true) {
		if (Math.floor((Math.random() * 1800) + 1) != 1) {
			return;
		}
		if (GameManager.company.staff.length == 1) {
			return;
		}
		var staffMember = GameManager.company.staff.skip(1).pickRandom();
		var cash = GameManager.company.cash;
		var stolen = cash * 0.05;
		if (stolen < 0) {
			return;
		}
		GameManager.company.notifications.push(new Notification("Stolen!".localize(), "Uh-oh, " + staffMember.name + " walked off with " + stolen.toLocaleString() + "Cr."));
		GameManager.company.notifications.push(new Notification(staffMember.name.localize(), staffMember.name + " left the company."));
		GameManager.company.adjustCash((stolen * -1), "Stolen!");
		GameManager.company.flags.fireEmployeeId = staffMember.id;
		DecisionNotifications.fireEmployee.complete(0);
		GDT.getDataStore("RoleImp").data.stolen = true;
		}
		
		GDT.off(GDT.eventKeys.gameplay.weekProceeded, RoleImp.Stolen);
		return;

	};

	RoleImp.BetterOffer = function () {
		if (GDT.getDataStore("RoleImp").data.boRan !== true) {
			if (GameManager.company.staff.length == 1) {
				return;
			}
			GameManager.company.notifications.push(betterOffer.getNotification(GameManager.company));
			GDT.getDataStore("RoleImp").data.boRan = true;
		}
		GDT.off(GDT.eventKeys.gameplay.contractFinished, RoleImp.BetterOffer);
	};
	var boeventId = "RoleImpBetterOfferEventID";
	var betterOffer = {
		id: boeventId,
		isRandom: false,
		maxTriggers: 1,
		trigger: null,
		getNotification: function (company) {
			var staffMember = GameManager.company.staff.skip(1).pickRandom();
			var salary = staffMember.salary;
			var raise = salary * 0.3;
			GDT.getDataStore("RoleImp").data.bostaffMember = staffMember.id;
			var message = staffMember.name + " did such a good job on that last contract that they now want to hire him! He will stay for a " + raise.toLocaleString() + "Cr. raise.".localize().format(staffMember.name);
			return new Notification({
				sourceId: boeventId,
				header: "Better Offer...".localize(),
				text: message,
				options: ["Offer Raise", "Let Go"]
			});
		},
		complete: function (decision) {
			var nullme = GDT.getDataStore("RoleImp").data.bostaffMember;
			var staffMember = GameManager.company.staff.first(function (staff) {
				return staff.id == nullme;
			});
			var salary = staffMember.salary;
			switch (decision) {
			case 0:
				salary = salary * 1.3;
				return GameManager.company.activeNotifications.addRange(new Notification("Raise Given".localize(), staffMember.name + " is now being paid " + salary.toLocaleString() + "Cr. a month.").split());
			case 1:
				GameManager.company.flags.fireEmployeeId = nullme;
				DecisionNotifications.fireEmployee.complete(0);
				return GameManager.company.activeNotifications.addRange(new Notification("Bye Bye".localize(), staffMember.name + " left the company.").split());

			default:
				return GameManager.company.activeNotifications.addRange(new Notification("Error", "There has been an error.").split());
			}
		}
	};

	RoleImp.BailOut = function () {
		if (GDT.getDataStore("RoleImp").data.bailRan !== true) {
			if (GameManager.company.staff.length == 1) {
				return;
			}
			GameManager.company.notifications.push(bailOut.getNotification(GameManager.company));
			GDT.getDataStore("RoleImp").data.bailRan = true;
		}
		GDT.off(GDT.eventKeys.gameplay.weekProceeded, RoleImp.BailOut);
	};

	var baileventId = "RoleImpBailOutEventID";
	var bailOut = {
		id: baileventId,
		isRandom: false,
		maxTriggers: 1,
		trigger: null,
		getNotification: function (company) {
			var staffMember = GameManager.company.staff.skip(1).pickRandom();
			GDT.getDataStore("RoleImp").data.bailstaffMember = staffMember.id;
			var message = staffMember.name + " had a pretty wild night and landed himself in jail. Looks like he won't be joining us again unless you bail him out!".localize().format(staffMember.name);
			return new Notification({
				sourceId: baileventId,
				header: "Bail!".localize(),
				text: message,
				options: ["Bail (5000)", "Do Nothing"]
			});
		},
		complete: function (decision) {
			var nullme = GDT.getDataStore("RoleImp").data.bailstaffMember;
			var staffMember = GameManager.company.staff.first(function (staff) {
				return staff.id == nullme;
			});
			switch (decision) {
			case 0:
				GameManager.company.adjustCash(-5000, "Bail");
				return GameManager.company.activeNotifications.addRange(new Notification("Bail Made".localize(), staffMember.name + " is a free man once again.".split()));
			case 1:
				GameManager.company.flags.fireEmployeeId = nullme;
				DecisionNotifications.fireEmployee.complete(0);
				return GameManager.company.activeNotifications.addRange(new Notification("Left in Jail".localize(), staffMember.name + " left the company.").split());
			default:
				return GameManager.company.activeNotifications.addRange(new Notification("Bail Out", "There has been an error.").split());
			}

		}
	};

	RoleImp.addGameExtentions = function () {
		var findMe = document.getElementById("gameLengthSelection");
		var appendMe = document.createElement("option");
		appendMe.text = "60 Years (long)";
		appendMe.value = "2";
		findMe.appendChild(appendMe);

		appendMe = document.createElement("option");
		appendMe.text = "84 Years (super long)";
		appendMe.value = "2.8";
		findMe.appendChild(appendMe);

	};

	RoleImp.addSpecialismOption = function () {
		var draw = "";
		draw += '<div id="specialism" class="centeredButtonWrapper">';
		draw += '<h2>Specialism</h2>';
		draw += '<select id="spSelect" style="max-width: 250px">';
		draw += '<option value="design">Design++</option>';
		draw += '<option value="normal" selected="selected">Normal</option>';
		draw += '<option value="normalPlus">Normal+</option>';
		draw += '<option value="tech">Technology++</option>';
		draw += '</select>';
		draw += '</div>';
		var findMe = document.getElementById("newGameView").getElementsByClassName("featureSelectionPanel featureSelectionPanelHiddenState")[0];
		console.log(findMe);
		findMe.innerHTML += draw;
		console.log(findMe);

	};
	RoleImp.setSpecialism = function () {
		var keepMe = UI.closeNewGameView;
		var inputMe = function () {
				var findMe = document.getElementById("spSelect").value;
				switch (findMe) {
				case "design":
					GameManager.company.staff[0].designFactor += (0.3);
					GameManager.company.staff[0].technologyFactor -= (0.1);
					break;
				case "tech":
					GameManager.company.staff[0].technologyFactor += (0.3);
					GameManager.company.staff[0].designFactor -= (0.1);
					break;
				case "normalPlus":
					GameManager.company.staff[0].technologyFactor += (0.15);
					GameManager.company.staff[0].designFactor += (0.15);
					break;
				case "normal":
					break;
				}
			};

		UI.closeNewGameView = function () {
			keepMe();
			inputMe()
		};

	};



	RoleImp.addCustomEvents = function () {
		GDT.addEvent(bailOut);
		GDT.addEvent(betterOffer);
		GDT.on(GDT.eventKeys.gameplay.afterReleaseGame, RoleImp.EventTrain);
		GDT.on(GDT.eventKeys.gameplay.contractFinished, RoleImp.BetterOffer);
		GDT.on(GDT.eventKeys.gameplay.weekProceeded, RoleImp.EventLottery);
		GDT.on(GDT.eventKeys.gameplay.weekProceeded, RoleImp.Stolen);
		GDT.on(GDT.eventKeys.gameplay.weekProceeded, RoleImp.BailOut);
	};



})();