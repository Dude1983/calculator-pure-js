class Calculator {

	constructor() {
		this._display = document.getElementsByClassName('display')[0];
		this._actions = document.getElementsByClassName('button');
		this._error = document.getElementsByClassName('division-by-zero-msg')[0];
		this._operators = ['+', '-', '*', '/'];
		this._expression = '';
		this._errorMsg = '';
	}

	get actionsLength() {
		return this._actions.length;
	}

	get actions() {
		return this._actions;
	}

	set expression(value) {
		this._expression += value;
	}

	get expression() {
		return this._expression;
	}

	get operators() {
		return this._operators;
	}

	set errorMsg(message) {
		this._errorMsg = message;
	}

	get errorMsg() {
		return this._errorMsg;
	}

	reInitExpression(expression) {
		this._expression = expression;
	}

	clear() {
		return () => {
			this._display.innerHTML = '';	
			this.reInitExpression('');	
			this.clearErrorMsg();			
		}
		
	}

	delete() {
		return () => {
			if (this.expression) {
				this.reInitExpression(this.expression.split('').splice(0, this.expression.split('').length-1).join(''));
				this.displayExpression();
				this.clearErrorMsg();				
			}
		}
	}

	clearErrorMsg() {
		this.errorMsg = '';
		this._error.innerHTML = '';
	}

	calculate() {
		return () => {			
			// Discard the operator if there's no digit after it so that it can be evaluated
			this.operators.map((o) => {
				if (this.expression.endsWith(o)) {
					this.reInitExpression(this.expression.split('').splice(0, this.expression.split('').length-1).join(''));	
				}
			});

			// In case of any bad formed expression when clicked on calculate button
			if ((this.expression.endsWith('.') && this.expression.length === 1) || (this.expression.endsWith('.') && this.operators.indexOf(this.expression[this.expression.length-2]) > -1)) {
				return;
			}

			// In case of division by 0
			if (!Number.isFinite(eval(this.expression))) {
				this.errorMsg = "Can't divide by 0";
				this._error.innerHTML = this.errorMsg;		
				return;		
			}

			this._display.innerHTML = eval(this.expression);	
			this.reInitExpression(this._display.innerHTML);	
			this._error.innerHTML = '';
		}		
	}

	displayExpression() {		
		this._display.innerHTML = this.expression.replace(/\//g, '÷').replace(/\*/g, 'x');
	}

	validateExpression(el) {
		return () => {
			let tempExpression = [],
			removed = [],
			splittedExpression = this.expression.split(/[-+*/]/),
			lastExpEl = this.expression[this.expression.length-1],
			beforeLastExpEl = this.expression[this.expression.length-2];

			// Clear deivision by 0 message if it appears
			if (this.errorMsg) {
				this.clearErrorMsg();				
			}

			// Check the expression for invalid input operators
			// Validations related to the operators
			if (lastExpEl === '.' && (el.innerHTML === '+' || el.innerHTML === '-' || el.innerHTML === 'x' || el.innerHTML === '÷')) {
				return;
			} else if (el.innerHTML === 'x' || el.innerHTML === '÷' || el.innerHTML === '+') {

				if (this.expression && this.expression !== '-') {

					let operatorSign = el.innerHTML === '+' ? el.innerHTML : (el.innerHTML === 'x' ? '*' : '/');

					if (this.operators.indexOf(lastExpEl) > -1 && this.operators.indexOf(beforeLastExpEl) > -1) {

						tempExpression = this.expression.split('');
						removed = tempExpression.splice(this.expression.length-2, 2, operatorSign);

						this.reInitExpression(tempExpression.join(''));

					} else if (this.operators.indexOf(lastExpEl) > -1) {
						tempExpression = this.expression.split('');
						removed = tempExpression.splice(this.expression.length-1, 1, operatorSign).join('');

						this.reInitExpression(tempExpression.join(''));

					} else {
						this.expression = operatorSign;
					}

				} else {
					this.clear();
				}
			} else if (el.innerHTML === '-') {

				if (lastExpEl === '+' || lastExpEl === '-') {

					tempExpression = this.expression.split('');
					removed = tempExpression.splice(this.expression.length-1, 1, '-').join('');

					this.reInitExpression(tempExpression.join(''));

				} else {
					this.expression = '-';
				}

			} else {
				// Validations related to the '0' and floating point
				if (el.innerHTML === '0' && this.expression.length === 1 && lastExpEl === '0') {
					return;
				} else if (lastExpEl === '0' && el.innerHTML !== '0' && el.innerHTML !== '.' && this.expression.length === 1) {
					this.reInitExpression(el.innerHTML);
				} else if (el.innerHTML === '0' && lastExpEl === '0' && this.operators.indexOf(beforeLastExpEl) > -1) {
					return;
				} else if (el.innerHTML !== '0' && el.innerHTML !== '.' && lastExpEl === '0' && this.operators.indexOf(beforeLastExpEl) > -1) {
					tempExpression = this.expression.split('');
					removed = tempExpression.splice(this.expression.length-1, 1, el.innerHTML).join('');

					this.reInitExpression(tempExpression.join(''));
				} else if ((el.innerHTML === '.' && splittedExpression[splittedExpression.length-1].split('.').length > 1) || el.innerHTML === '.' && lastExpEl === '.') {
					return;

				} else {
					this.expression = el.innerHTML;						
				}				
			}

			this.displayExpression();
		}
	}
}


let init = () => {
	let calculator = new Calculator();

	for (let i = 0; i < calculator.actionsLength; i++) {
		if (calculator.actions[i].classList.contains('clear')) {
			calculator.actions[i].addEventListener('click', calculator.clear());
		} else if (calculator.actions[i].classList.contains('equals')) {
			calculator.actions[i].addEventListener('click', calculator.calculate());
		} else if (calculator.actions[i].classList.contains('delete')) {
			calculator.actions[i].addEventListener('click', calculator.delete());
		} else {
			calculator.actions[i].addEventListener('click', calculator.validateExpression(calculator.actions[i]));
		}
	}
}

document.addEventListener('DOMContentLoaded', init);
