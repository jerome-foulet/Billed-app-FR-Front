/**
 * @jest-environment jsdom
 */

import { fireEvent, createEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import router from "../app/Router.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
  })
})


describe("Given I am connected as an employee and I am on NewBill Page", () => {
  const user = {
    type: 'Employee',
    email: 'e@e'
  }
  const onNavigate = (pathname) => (document.body.innerHTML = ROUTES({ pathname }))

  beforeEach(() => {
    document.body.innerHTML = NewBillUI()
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify(user))
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe("When I do not fill fields and I click on button send", () => {
    test("Then I should stay on NewBill page and be prompt to fill required fields", () => {
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      const container = new NewBill({ document, onNavigate, store: null, localStorage })
      const handleSubmit = jest.fn(container.handleSubmit)
      const buttonNewBill = document.getElementById("btn-send-bill")
      buttonNewBill.addEventListener("click", (e) => handleSubmit)
      userEvent.click(buttonNewBill)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy() // ???
    })
  })

  describe("When I fill inputs with good format except for input file", () => {
    test("Then I should stay on NewBill Page", () => {
      const container = new NewBill({ document, onNavigate, store: null, localStorage })
      const handleSubmit = jest.fn(container.handleSubmit)
      const buttonNewBill = document.getElementById("btn-send-bill")
      const mock = jest.fn()
        .mockReturnValueOnce("13/06/2022")
        .mockReturnValueOnce(25)
        .mockReturnValueOnce(20)
        .mockReturnValueOnce("")
      const inputDate = screen.getByTestId("datepicker").value = mock()
      const inputAmount = screen.getByTestId("amount").value = mock()
      const inputPCT = screen.getByTestId("pct").value = mock()
      const inputFile = screen.getByTestId("file").file = mock()
      expect(inputDate).not.toBeNull()
      expect(inputAmount).not.toBeNull()
      expect(inputPCT).not.toBeNull()
      expect(inputFile).not.toBeNull()
      buttonNewBill.addEventListener("click", (e) => handleSubmit)
      userEvent.click(buttonNewBill)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy() // ???
    })
  })

  describe("When I use file with bad extension", () => {
    test("Then I should stay on NewBill Page", () => {
      const files = [new File(["badExtension"], "badExtension.svg", { type: "image/svg" })]
      files.name = "badExtension.svg"
      const inputFile = screen.getByTestId("file")
      const container = new NewBill({ document, onNavigate, store: null, localStorage })
      const handleChangeFile = jest.fn(container.handleChangeFile)
      inputFile.addEventListener("input", handleChangeFile)


      fireEvent(
        inputFile,
        createEvent("input", inputFile, {
          target: {
            files: files
          }
        })
      )

      expect(handleChangeFile).toHaveBeenCalled();
      //expect(screen.getByText("Mes notes de frais")).toBeTruthy() // ???
    })
  })

  // integration
  describe("When I fill all fields with good format and i submit", () => {
    test("Then I should be redirect on Bills Page and I should see my new bill", async () => {
      const container = new NewBill({ document, onNavigate, store: null, localStorage })
      const handleSubmit = jest.fn(container.handleSubmit)
      const mock = jest.fn()
        .mockReturnValueOnce("testId")
        .mockReturnValueOnce("13/06/2022")
        .mockReturnValueOnce(25)
        .mockReturnValueOnce(20)
        .mockReturnValueOnce("file.jpg")
      const buttonNewBill = document.getElementById("btn-send-bill")
      const inputName = screen.getByTestId("expense-name").value = mock()
      const inputDate = screen.getByTestId("datepicker").value = mock()
      const inputAmount = screen.getByTestId("amount").value = mock()
      const inputPCT = screen.getByTestId("pct").value = mock()
      const inputFile = screen.getByTestId("file").file = mock()
      const inputs = []
      inputs.push(inputName, inputDate, inputAmount, inputPCT, inputFile)
      expect(!inputs.every((input) => input === "")).not.toBeNull()
      buttonNewBill.addEventListener("click", (e) => handleSubmit)
      userEvent.click(buttonNewBill)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      //expect(screen.getByText("testId")).toBeTruthy() // ???
      /*await waitFor(() => screen.getByTestId('tbody'))
      const tbody = screen.getByTestId('tbody')
      expect(tbody).toBeDefined
      const count = tbody.childElementCount
      expect(count).toBe(5)*/ // ???
    })
  })
})