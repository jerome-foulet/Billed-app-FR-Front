/**
 * @jest-environment jsdom
 */

import { fireEvent, createEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js"

jest.mock("../app/store", () => mockStore)


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

  describe("When I use good file extension", () => {
    test("Then isExtensionAvailable must return true", () => {
      const fileExtension = "jpg"
      const container = new NewBill({ document, onNavigate, store: null, localStorage })
      const isExtensionAvailable = jest.fn(container.isExtensionAvailable)
      expect(isExtensionAvailable(fileExtension)).toBeTruthy()

    })
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
      const inputFile = screen.getByTestId("file")
      const container = new NewBill({ document, onNavigate, store: null, localStorage })
      const handleChangeFile = jest.fn(container.handleChangeFile)
      inputFile.addEventListener("change", handleChangeFile)
      
      fireEvent(
        inputFile,
        createEvent("change", inputFile, {
          target: {
            files: files
          }
        })
      )
      expect(handleChangeFile).toHaveBeenCalled();

      const event = {
        preventDefault() {},
        target: { value: 'badExtension.svg' }
      }
      expect(handleChangeFile(event)).toBe(0)
    })
  })

  
  describe("When I use file with good extension", () => {
    test("Then I should be redirect on Bills Page", () => {
      jest.spyOn(mockStore, "bills")
      const files = [new File(["goodExtension"], "goodExtension.jpg", { type: "image/jpeg" })]
      const inputFile = screen.getByTestId("file")
      const container = new NewBill({ document, onNavigate, store: mockStore, localStorage })
      const handleChangeFile = jest.fn(container.handleChangeFile)
      inputFile.addEventListener("change", handleChangeFile)
      
      fireEvent(
        inputFile,
        createEvent("change", inputFile, {
          target: {
            files: files
          }
        })
      )
      expect(handleChangeFile).toHaveBeenCalled();

      const event = {
        preventDefault() {},
        target: { value: 'goodExtension.jpg' }
      }
      expect(handleChangeFile(event)).not.toBe(0)
    })
  })

  // integration
  describe("When I fill all fields with good format and i submit", () => {
    test("Then I should be redirect on Bills Page and I should see my new bill", async () => {
      jest.spyOn(mockStore, "bills")
      const files = [new File(["goodExtension"], "goodExtension.jpg", { type: "image/jpeg" })]
      const container = new NewBill({ document, onNavigate, store: mockStore, localStorage })
      const handleSubmit = jest.fn(container.handleSubmit)
      const mock = jest.fn()
        .mockReturnValueOnce("testId")
        .mockReturnValueOnce("13/06/2022")
        .mockReturnValueOnce(25)
        .mockReturnValueOnce(20)
      const buttonNewBill = document.getElementById("btn-send-bill")
      const inputName = screen.getByTestId("expense-name").value = mock()
      const inputDate = screen.getByTestId("datepicker").value = mock()
      const inputAmount = screen.getByTestId("amount").value = mock()
      const inputPCT = screen.getByTestId("pct").value = mock()
      const inputFile = screen.getByTestId("file")

      fireEvent(
        inputFile,
        createEvent("change", inputFile, {
          target: {
            files: files
          }
        })
      )

      buttonNewBill.addEventListener("click", (e) => handleSubmit)
      userEvent.click(buttonNewBill)
      expect(screen.getByText("Mes notes de frais")).toBeTruthy()

      /*await waitFor(() => screen.getByText("encore"))
      expect(screen.getByText("encore")).toBeTruthy() // ???
      /*await waitFor(() => screen.getByTestId('tbody'))
      const tbody = screen.getByTestId('tbody')
      expect(tbody).toBeDefined
      const count = tbody.childElementCount
      expect(count).toBe(5)*/ // ???
    })
  })
})