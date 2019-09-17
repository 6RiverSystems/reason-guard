export class DemoAssistant {
	generateSomething() {
		const randomNumber = Math.floor(Math.random() * 6);

		switch (randomNumber) {
		case 1:
			return 'Hello';
		case 2:
			return 7;
		case 3:
			return () => 'dinosaur';
		case 4:
			return false;
		default:
			return undefined;
		}
	}
}
