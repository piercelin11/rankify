jest.mock("color-convert", () => ({
	__esModule: true,
	default: {
		hex: { rgb: jest.fn(() => [0, 0, 0]) },
		rgb: { lab: jest.fn(() => [0, 0, 0]), hex: jest.fn(() => "000000") },
		lab: { lch: jest.fn(() => [0, 0, 0]), rgb: jest.fn(() => [0, 0, 0]) },
		lch: { lab: jest.fn(() => [0, 0, 0]) },
	},
}));

import { render, screen } from "@testing-library/react";
import Button from "../Button";
import userEvent from "@testing-library/user-event";

describe("Buttom Components", () => {
	const buttonText = "Click";

	test("should be in document when render", () => {
		render(<Button variant={"primary"}>{buttonText}</Button>);

		const buttonElementByRole = screen.getByRole("button", {
			name: buttonText,
		});
		expect(buttonElementByRole).toBeInTheDocument();
	});

	describe("when button is clicked", () => {
		let mockedHandleClick: jest.Mock;

		beforeEach(() => {
			mockedHandleClick = jest.fn();
		});

		test("should call the passed-in onClick function when the button is clicked", async () => {
			render(
				<Button variant={"primary"} onClick={mockedHandleClick}>
					{buttonText}
				</Button>
			);

			const buttonElement = screen.getByRole("button", { name: buttonText });
			await userEvent.click(buttonElement);

			expect(mockedHandleClick).toHaveBeenCalledTimes(1);
		});

		test("shouldn't call the passed-in onClick function when the button is disabled", async () => {
			render(
				<Button variant={"primary"} onClick={mockedHandleClick} disabled={true}>
					{buttonText}
				</Button>
			);

			const buttonElement = screen.getByRole("button", { name: buttonText });

			expect(buttonElement).toBeDisabled();
			await userEvent.click(buttonElement);
			expect(mockedHandleClick).toHaveBeenCalledTimes(0);
		});
	});

	test("button has data-test-rounded attribute when rounded is true", () => {
		render(
			<Button variant={"primary"} rounded={true}>
				{buttonText}
			</Button>
		);
		const buttonElement = screen.getByRole("button", { name: buttonText });

		expect(buttonElement).toHaveAttribute("data-test-rounded");
	});

	test.each(["primary", "secondary", "ghost", "outline", "menu", "neutral"])(
		"button has the right data-variant-rounded attribute",
		(variant) => {
			render(<Button variant={variant as any}>{buttonText}</Button>);
			const buttonElement = screen.getByRole("button", { name: buttonText });

			expect(buttonElement).toHaveAttribute("data-test-variant", variant);
		}
	);
});
